import { Users } from '../../../models/server';
import { settings } from '../../../settings/server';

const filterStarred = (message, uid) => {
	// only return starred field if user has it starred
	if (message.starred && Array.isArray(message.starred)) {
		//message.starred = message.starred.filter((star) => star._id === uid);
	}
	return message;
};

// TODO: we should let clients get user names on demand instead of doing this

export const normalizeMessagesForUserCustomFieldsThread = (messages) => {
	// if not using real names, there is nothing else to do

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

	return messages;
};
