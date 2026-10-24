import { Router } from "express";
import {userAuth} from "../middleware/auth.middleware.js";
import { deleteChats, retriveChats, retriveMessages, sendMessage, sendEmailDraft, listEmailDrafts } from "../controller/message.contoller.js";
import { validateSendEmailDraft } from "../validator/validate.js";

const chatRouter = Router();

///** @route POST api/chat/send-message
// * @desc Send a message in a chat
 //* @access Private  

chatRouter.post('/send-message', userAuth, sendMessage);

/** @route POST api/chats/send-email
 * @desc Send an email the AI drafted, after the user reviewed it
 * @access Private
 */
chatRouter.post('/send-email', userAuth, validateSendEmailDraft, sendEmailDraft);

/** @route GET api/chats/email-drafts
 * @desc All email drafts (unsent + sent) across the user's chats
 * @access Private
 */
chatRouter.get('/email-drafts', userAuth, listEmailDrafts);

chatRouter.get('/retrive-chats', userAuth, retriveChats);

chatRouter.get('/retrive-msg/:chatId', userAuth, retriveMessages);

chatRouter.delete('/delete/:chatId', userAuth, deleteChats)

export default chatRouter;  