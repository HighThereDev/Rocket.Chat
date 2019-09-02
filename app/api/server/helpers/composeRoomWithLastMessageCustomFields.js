import { normalizeMessagesForUserCustomFields } from '../../../utils/server/lib/normalizeMessagesForUserCustomFields';
import { API } from '../api';

API.helperMethods.set('composeRoomWithLastMessageCustomFields', function _composeRoomWithLastMessageCustomFields(room, userId) {
	if (room.lastMessage) {
		const [lastMessage] = normalizeMessagesForUserCustomFields([room.lastMessage], userId);
		room.lastMessage = lastMessage;
	}

	room.customFields = null;
	
	return room;
});
