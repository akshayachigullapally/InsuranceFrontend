export const NOTIFICATION_TYPES = [
  'POLICY_SUBMITTED',
  'POLICY_APPROVED',
  'POLICY_REJECTED',
  'POLICY_CANCELLED',
  'POLICY_EXPIRED',
  'POLICY_RENEWAL_DUE',
  'POLICY_DOCUMENT_REQUESTED',
  'PRODUCT_CREATED',
  'PRODUCT_UPDATED',
  'CLAIM_SUBMITTED',
  'CLAIM_UNDER_REVIEW',
  'CLAIM_APPROVED',
  'CLAIM_REJECTED',
  'CLAIM_CANCELLED',
  'CLAIM_SETTLED',
  'MANUAL_CLAIM_SUBMITTED',
  'MANUAL_CLAIM_INVESTIGATION_STARTED',
  'MANUAL_CLAIM_INVESTIGATION_COMPLETED',
  'AUTOMATIC_CLAIM_CREATED',
  'CLAIM_DOCUMENT_REQUESTED',
  'CLAIM_REMINDER',
  'CLAIM_ESCALATED',
  'CLAIM_PAYMENT_INITIATED',
  'TRIGGER_DETECTED',
  'TRIGGER_VERIFIED',
  'TRIGGER_REJECTED',
  'TRIGGER_PROCESSED',
  'THRESHOLD_APPROACHING',
  'TRIGGER_THRESHOLD_EXCEEDED',
  'TRIGGER_EVENT_DETECTED',
  'TRIGGER_EVENT_VERIFIED',
  'TRIGGER_EVENT_REJECTED',
  'MANUAL_TRIGGER_CONFIRMED',
  'MANUAL_TRIGGER_NOT_CONFIRMED',
  'PARAMETRIC_COVERAGE_TRIGGERED',
  'OBSERVATION_CREATED',
  'PERIL_CREATED',
  'TRIGGER_DEFINITION_CREATED',
  'LOCATION_ZONE_CREATED',
  'PAYMENT_SUCCESS',
  'PAYMENT_FAILED',
  'PAYMENT_PENDING',
  'PAYMENT_RETRY',
  'PAYMENT_REFUNDED',
  'PAYOUT_INITIATED',
  'PAYOUT_PROCESSED',
  'PAYOUT_SUCCESS',
  'PAYOUT_FAILED',
  'PAYOUT_PENDING',
  'PAYOUT_RETRY',
  'QUOTE_CREATED',
  'QUOTE_EXPIRED',
  'QUOTE_CONSUMED',
  'PREMIUM_DUE',
  'PREMIUM_OVERDUE',
  'REFUND_PROCESSED',
  'REFUND_FAILED',
  'RECONCILIATION_COMPLETED',
  'RECONCILIATION_DISCREPANCY',
  'PRICING_RULE_CREATED',
  'PRICING_RULE_UPDATED',
  'GENERAL',
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const RELATED_ENTITY_TYPES = [
  'POLICY',
  'CLAIM',
  'TRIGGER_EVENT',
  'PAYMENT',
  'PAYOUT',
  'USER',
  'PRODUCT',
  'QUOTE',
  'PRICING_RULE',
  'RECONCILIATION',
] as const;

export type RelatedEntityType = (typeof RELATED_ENTITY_TYPES)[number];

const DELIVERY_CHANNELS = ['IN_APP', 'EMAIL', 'SMS'] as const;

export type DeliveryChannel = (typeof DELIVERY_CHANNELS)[number];

export const DELIVERY_STATUSES = ['DELIVERED', 'FAILED', 'PENDING', 'SKIPPED'] as const;

export type DeliveryStatus = (typeof DELIVERY_STATUSES)[number];

export interface NotificationResponse {
  id: number;
  notificationReference: string;
  recipientUserId?: number | null;
  recipientCustomerId?: number | null;
  recipientRole?: string | null;
  type: NotificationType;
  title: string;
  message: string;
  relatedEntityType?: RelatedEntityType | null;
  relatedEntityId?: number | null;
  read: boolean;
  readAt?: string | null;
  deliveryChannel: DeliveryChannel;
  deliveryChannels?: DeliveryChannel[];
  deliveryStatus: DeliveryStatus;
  retryCount?: number;
  maxRetries?: number;
  correlationId?: string | null;
  idempotencyKey?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface NotificationRequest {
  recipientUserId?: number | null;
  recipientCustomerId?: number | null;
  recipientRole?: string | null;
  type: NotificationType;
  title: string;
  message: string;
  relatedEntityType?: RelatedEntityType | null;
  relatedEntityId?: number | null;
  deliveryChannel?: DeliveryChannel;
  deliveryChannels?: DeliveryChannel[];
  maxRetries?: number;
}

export interface TemplateNotificationRequest {
  templateCode: string;
  userId?: number | null;
  customerId?: number | null;
  role?: string | null;
  relatedEntityId?: number | null;
  templateData?: Record<string, unknown>;
}

export interface BatchNotificationRequest {
  userIds: number[];
  notification: Omit<
    NotificationRequest,
    'recipientUserId' | 'recipientCustomerId' | 'recipientRole'
  >;
}

export interface NotificationTemplateResponse {
  id: number;
  templateCode: string;
  notificationType: NotificationType;
  titleTemplate: string;
  messageTemplate: string;
  defaultChannel: DeliveryChannel;
  active: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CreateNotificationTemplateRequest {
  templateCode: string;
  notificationType: NotificationType;
  titleTemplate: string;
  messageTemplate: string;
  defaultChannel?: DeliveryChannel;
}

export interface NotificationPreferenceResponse {
  id: number;
  userId: number;
  customerId?: number | null;
  notificationType: NotificationType;
  inAppEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export interface UpsertNotificationPreferenceRequest {
  notificationType: NotificationType;
  inAppEnabled?: boolean;
  emailEnabled?: boolean;
  smsEnabled?: boolean;
}

export interface DeliveryAttemptResponse {
  id: number;
  notificationId: number;
  deliveryChannel: DeliveryChannel;
  deliveryStatus: DeliveryStatus;
  attemptNumber: number;
  errorMessage?: string | null;
  attemptedAt: string;
  completedAt?: string | null;
}

export interface UnreadCountResponse {
  count: number;
}

export interface MessageResponse {
  message: string;
}
