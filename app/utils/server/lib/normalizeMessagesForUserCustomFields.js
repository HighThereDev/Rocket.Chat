import { Users, Messages } from '../../../models/server';
import { settings } from '../../../settings/server';

const filterStarred = (message, uid) => {
	// only return starred field if user has it starred
	if (message.starred && Array.isArray(message.starred)) {
		//message.starred = message.starred.filter((star) => star._id === uid);
	}
	return message;
};

// TODO: we should let clients get user names on demand instead of doing this
const _id = (doc={}) => String(doc.id || doc._id);

const cleanSubMessage = ({ _id, attachments, customFields, mentions, replies, msg, u, ts, _updatedAt}) => ({
	_id,
	...(attachments ? { attachments } : {}),
	...(customFields ? { customFields } : {}),
	...(mentions ? { mentions } : {}),
	...(replies ? { replies } : {}),
	msg,
	u,
	ts,
	_updatedAt,
});

export const normalizeMessagesForUserCustomFields = (messages, uid, populate=true) => {
	console.log(`normalizing messages for user custom fields`);
	if (populate) {
		console.log(`populating replies`);

		const _messages = messages.reduce((acc, message) => {
			acc[_id(message)] = message;
			return acc;
		}, {});

		const replies = messages.reduce((acc, message) => {
			if (!message.tmid) { return acc; }
			if (!acc[message.tmid] || acc[message.tmid].ts < message.ts) {
				acc[message.tmid] = message;
			}
			return acc;
		}, {});

		messages.forEach((message) => {
			if (message.tcount && message.tcount > 0) {
				console.log('getting last reply');
				if (replies[_id(message)]) {
					message.last_reply = cleanSubMessage(replies[_id(message)]);
				} else {
					const reply_message = Messages.findOne({ tmid: message._id }, { sort: { ts: -1 } });
					if (reply_message) {
						message.last_reply = cleanSubMessage(reply_message);
						replies[_id(message)] = reply_message;
					}
				}
			}
		});


		messages.forEach((message) => {
			if (message.tmid) {
				if (_messages[message.tmid]) {
					message.parent = cleanSubMessage(_messages[message.tmid]);
				} else {
					const parent_message = Messages.findOneById(message.tmid);
					if (parent_message) {
						message.parent = cleanSubMessage(parent_message);
						_messages[message.tmid] = parent_message;
					}
				}
			}
		});
	}

	// if not using real names, there is nothing else to do
	if (!settings.get('UI_Use_Real_Name')) {
		messages.forEach((message) => {

			if (message.customFields !== undefined) {
				if (message.customFields.loc !== undefined) {
					message.customFields.loc = null;
				}

				if (message.customFields.additional_data !== undefined) {
					message.customFields.additional_data = null;
				}
			}
		});

		return messages;//messages.map((message) => filterStarred(message, uid));
	}

	const usernames = new Set();

	messages.forEach((message) => {
		//message = filterStarred(message, uid);

		if (message.customFields !== undefined) {
			if (message.customFields.loc !== undefined) {
				message.customFields.loc = null;
			}

			if (message.customFields.additional_data !== undefined) {
				message.customFields.additional_data = null;
			}
		}

		usernames.add(message.u.username);

		(message.mentions || []).forEach(({ username }) => { usernames.add(username); });

		Object.values(message.reactions || {})
			.forEach((reaction) => reaction.usernames.forEach((username) => usernames.add(username)));
	});

	const users = {};

	Users.findUsersByUsernames([...usernames.values()], {
		fields: {
			username: 1,
			name: 1,
		},
	}).forEach((user) => {
		users[user.username] = user.name;
	});

	messages.forEach((message) => {
		message.u.name = users[message.u.username];

		(message.mentions || []).forEach((mention) => { mention.name = users[mention.username]; });

		Object.keys(message.reactions || {}).forEach((reaction) => {
			const names = message.reactions[reaction].usernames.map((username) => users[username]);
			message.reactions[reaction].names = names;
		});
	});

	return messages;
};
