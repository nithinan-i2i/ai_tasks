const NotificationService = require('../src/services/NotificationService');
const NotificationModel = require('../src/models/NotificationModel');
const MessageService = require('../src/services/MessageService');
const logger = require('../src/utils/logger');

jest.mock('../src/models/NotificationModel');
jest.mock('../src/services/MessageService');
jest.mock('../src/utils/logger');

describe('NotificationService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendInAppNotification', () => {
    it('should save notification and return it', async () => {
      const mockNotif = { _id: 'notif1', userId: 'user1', content: 'msg' };
      NotificationModel.create.mockResolvedValue(mockNotif);
      const result = await NotificationService.sendInAppNotification('user1', 'msg');
      expect(NotificationModel.create).toHaveBeenCalledWith({
        userId: 'user1',
        type: 'message',
        content: 'msg',
        status: 'unread',
      });
      expect(result).toBe(mockNotif);
      expect(logger.info).toHaveBeenCalled();
    });
    it('should throw on invalid input', async () => {
      await expect(NotificationService.sendInAppNotification('', '')).rejects.toThrow('Invalid input');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('sendEmailNotification', () => {
    it('should send email and save notification', async () => {
      MessageService.getUserEmail.mockResolvedValue('test@example.com');
      MessageService.sendEmail.mockResolvedValue();
      const mockNotif = { _id: 'notif2', userId: 'user2', content: 'subject' };
      NotificationModel.create.mockResolvedValue(mockNotif);
      const result = await NotificationService.sendEmailNotification('user2', 'subject', 'body');
      expect(MessageService.getUserEmail).toHaveBeenCalledWith('user2');
      expect(MessageService.sendEmail).toHaveBeenCalledWith('test@example.com', 'subject', 'body');
      expect(NotificationModel.create).toHaveBeenCalledWith({
        userId: 'user2',
        type: 'system',
        content: 'subject',
        status: 'unread',
        meta: { email: 'test@example.com', body: 'body' },
      });
      expect(result).toBe(mockNotif);
      expect(logger.info).toHaveBeenCalled();
    });
    it('should throw on invalid input', async () => {
      await expect(NotificationService.sendEmailNotification('', '', '')).rejects.toThrow('Invalid input');
      expect(logger.error).toHaveBeenCalled();
    });
    it('should throw if email sending fails', async () => {
      MessageService.getUserEmail.mockResolvedValue('fail@example.com');
      MessageService.sendEmail.mockRejectedValue(new Error('fail'));
      await expect(NotificationService.sendEmailNotification('user3', 'subject', 'body')).rejects.toThrow('fail');
      expect(logger.error).toHaveBeenCalled();
    });
  });
}); 