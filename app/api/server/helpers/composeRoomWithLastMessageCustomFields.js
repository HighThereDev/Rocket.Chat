import { normalizeMessagesForUserCustomFields } from '../../../utils/server/lib/normalizeMessagesForUserCustomFields';
import { API } from '../api';

API.helperMethods.set('composeRoomWithLastMessageCustomFields', function _composeRoomWithLastMessageCustomFields(room, userId) {
	if (room.lastMessage) {
		const [lastMessage] = normalizeMessagesForUserCustomFields([room.lastMessage], userId);
		room.lastMessage = lastMessage;
	}
	
	if(room.customFields){
		room.customFields.loc = null;
		room.customFields.additional_data = null;
	}

	return room;
});
