import { normalizeMessagesForUserCustomFields } from '../../../utils/server/lib/normalizeMessagesForUserCustomFields';
import { API } from '../api';
import { Subscriptions } from '../../../models/server';

API.helperMethods.set('composeRoomWithLastMessageCustomFields', function _composeRoomWithLastMessageCustomFields(room, userId) {
	if (room.lastMessage) {
		const [lastMessage] = normalizeMessagesForUserCustomFields([room.lastMessage], userId);
		room.lastMessage = lastMessage;
	}
	
	if(room.customFields){
		room.customFields.loc = null;
		room.customFields.additional_data = null;
	}

	let members = [];
	let favorites = [];

	const subscriptions = Subscriptions.findByRoomId(room._id, {
		fields: { 'u._id': 1, 'f': 1 }
	}).fetch().forEach((subscription) => {
		members.push(subscription.u._id);
		if(subscription.f !== undefined && subscription.f === true){
			favorites.push(subscription.u._id);
		}
	});

	//subscriptions doesn't update user username/name  if  changed
	/*
	//not needed, only ids are enough right?
	const users = Users.find({ _id: { $in: members } }, {
		fields: { _id: 1, username: 1, name: 1 }
	}).fetch();
	*/

	room.participants = members;
	room.favorites = favorites;

	return room;
});
