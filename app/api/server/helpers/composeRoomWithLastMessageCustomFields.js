import { normalizeMessagesForUserCustomFields } from '../../../utils/server/lib/normalizeMessagesForUserCustomFields';
import { API } from '../api';
import { Users, Subscriptions } from '../../../models/server';

API.helperMethods.set('composeRoomWithLastMessageCustomFields', function _composeRoomWithLastMessageCustomFields(room, userId) {
	if (room.lastMessage) {
		const [lastMessage] = normalizeMessagesForUserCustomFields([room.lastMessage], userId);
		room.lastMessage = lastMessage;
	}
	
	if(room.customFields){
		room.customFields.loc = null;
		room.customFields.additional_data = null;
	}

	const subscriptions = Subscriptions.findByRoomId(room._id, {
		fields: { 'u._id': 1 }
	});

	const members = subscriptions.fetch().map((s) => s.u && s.u._id);

	const users = Users.find({ _id: { $in: members } }, {
		fields: { _id: 1, username: 1, name: 1 }
	}).fetch();

	room.participants = users;


	return room;
});
