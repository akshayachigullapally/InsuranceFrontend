import {
  DeliveryStatus,
  NotificationResponse,
  NotificationType,
  RelatedEntityType,
} from '../dtos/notifications/notification-response.dto';

export const NOTIFICATION_ICONS: Record<string, string> = {
  POLICY_SUBMITTED: '📄',
  POLICY_APPROVED: '✅',
  POLICY_REJECTED: '❌',
  POLICY_CANCELLED: '🚫',
  POLICY_EXPIRED: '⏳',
  POLICY_RENEWAL_DUE: '🔄',
  POLICY_DOCUMENT_REQUESTED: '📎',
  PRODUCT_CREATED: '🆕',
  PRODUCT_UPDATED: '✏️',
  CLAIM_SUBMITTED: '📋',
  CLAIM_UNDER_REVIEW: '🔍',
  CLAIM_APPROVED: '✅',
  CLAIM_REJECTED: '❌',
  CLAIM_CANCELLED: '🚫',
  CLAIM_SETTLED: '🏁',
  MANUAL_CLAIM_SUBMITTED: '📝',
  MANUAL_CLAIM_INVESTIGATION_STARTED: '🔎',
  MANUAL_CLAIM_INVESTIGATION_COMPLETED: '🔎',
  AUTOMATIC_CLAIM_CREATED: '🤖',
  CLAIM_DOCUMENT_REQUESTED: '📎',
  CLAIM_REMINDER: '⏰',
  CLAIM_ESCALATED: '🚨',
  CLAIM_PAYMENT_INITIATED: '💳',
  TRIGGER_DETECTED: '📡',
  TRIGGER_VERIFIED: '⚡',
  TRIGGER_REJECTED: '⛔',
  TRIGGER_PROCESSED: '⚙️',
  THRESHOLD_APPROACHING: '⚠️',
  TRIGGER_THRESHOLD_EXCEEDED: '🚨',
  TRIGGER_EVENT_DETECTED: '📡',
  TRIGGER_EVENT_VERIFIED: '⚡',
  TRIGGER_EVENT_REJECTED: '⛔',
  MANUAL_TRIGGER_CONFIRMED: '⚡',
  MANUAL_TRIGGER_NOT_CONFIRMED: '⛔',
  PARAMETRIC_COVERAGE_TRIGGERED: '🌦️',
  OBSERVATION_CREATED: '🔭',
  PERIL_CREATED: '⚠️',
  TRIGGER_DEFINITION_CREATED: '🧩',
  LOCATION_ZONE_CREATED: '📍',
  PAYMENT_SUCCESS: '💰',
  PAYMENT_FAILED: '💸',
  PAYMENT_PENDING: '🕓',
  PAYMENT_RETRY: '🔁',
  PAYMENT_REFUNDED: '↩️',
  PAYOUT_INITIATED: '💳',
  PAYOUT_PROCESSED: '💵',
  PAYOUT_SUCCESS: '✅',
  PAYOUT_FAILED: '💸',
  PAYOUT_PENDING: '🕓',
  PAYOUT_RETRY: '🔁',
  QUOTE_CREATED: '📝',
  QUOTE_EXPIRED: '⌛',
  QUOTE_CONSUMED: '🛒',
  PREMIUM_DUE: '🧾',
  PREMIUM_OVERDUE: '⛔',
  REFUND_PROCESSED: '💷',
  REFUND_FAILED: '💥',
  RECONCILIATION_COMPLETED: '✔️',
  RECONCILIATION_DISCREPANCY: '🔎',
  PRICING_RULE_CREATED: '🏷️',
  PRICING_RULE_UPDATED: '🏷️',
  GENERAL: '📢',
};

export const NOTIFICATION_COLORS: Record<string, string> = {
  POLICY_SUBMITTED: 'bg-blue-100 text-blue-800',
  POLICY_APPROVED: 'bg-green-100 text-green-800',
  POLICY_REJECTED: 'bg-red-100 text-red-800',
  POLICY_CANCELLED: 'bg-gray-100 text-gray-800',
  POLICY_EXPIRED: 'bg-yellow-100 text-yellow-800',
  POLICY_RENEWAL_DUE: 'bg-orange-100 text-orange-800',
  POLICY_DOCUMENT_REQUESTED: 'bg-indigo-100 text-indigo-800',
  PRODUCT_CREATED: 'bg-teal-100 text-teal-800',
  PRODUCT_UPDATED: 'bg-teal-100 text-teal-800',
  CLAIM_SUBMITTED: 'bg-blue-100 text-blue-800',
  CLAIM_UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
  CLAIM_APPROVED: 'bg-green-100 text-green-800',
  CLAIM_REJECTED: 'bg-red-100 text-red-800',
  CLAIM_CANCELLED: 'bg-gray-100 text-gray-800',
  CLAIM_SETTLED: 'bg-green-100 text-green-800',
  MANUAL_CLAIM_SUBMITTED: 'bg-blue-100 text-blue-800',
  MANUAL_CLAIM_INVESTIGATION_STARTED: 'bg-yellow-100 text-yellow-800',
  MANUAL_CLAIM_INVESTIGATION_COMPLETED: 'bg-green-100 text-green-800',
  AUTOMATIC_CLAIM_CREATED: 'bg-violet-100 text-violet-800',
  CLAIM_DOCUMENT_REQUESTED: 'bg-indigo-100 text-indigo-800',
  CLAIM_REMINDER: 'bg-orange-100 text-orange-800',
  CLAIM_ESCALATED: 'bg-red-100 text-red-800',
  CLAIM_PAYMENT_INITIATED: 'bg-purple-100 text-purple-800',
  TRIGGER_DETECTED: 'bg-purple-100 text-purple-800',
  TRIGGER_VERIFIED: 'bg-purple-100 text-purple-800',
  TRIGGER_REJECTED: 'bg-red-100 text-red-800',
  TRIGGER_PROCESSED: 'bg-purple-100 text-purple-800',
  THRESHOLD_APPROACHING: 'bg-orange-100 text-orange-800',
  TRIGGER_THRESHOLD_EXCEEDED: 'bg-red-100 text-red-800',
  TRIGGER_EVENT_DETECTED: 'bg-purple-100 text-purple-800',
  TRIGGER_EVENT_VERIFIED: 'bg-purple-100 text-purple-800',
  TRIGGER_EVENT_REJECTED: 'bg-red-100 text-red-800',
  MANUAL_TRIGGER_CONFIRMED: 'bg-purple-100 text-purple-800',
  MANUAL_TRIGGER_NOT_CONFIRMED: 'bg-red-100 text-red-800',
  PARAMETRIC_COVERAGE_TRIGGERED: 'bg-emerald-100 text-emerald-800',
  OBSERVATION_CREATED: 'bg-cyan-100 text-cyan-800',
  PERIL_CREATED: 'bg-red-100 text-red-800',
  TRIGGER_DEFINITION_CREATED: 'bg-violet-100 text-violet-800',
  LOCATION_ZONE_CREATED: 'bg-amber-100 text-amber-800',
  PAYMENT_SUCCESS: 'bg-green-100 text-green-800',
  PAYMENT_FAILED: 'bg-red-100 text-red-800',
  PAYMENT_PENDING: 'bg-yellow-100 text-yellow-800',
  PAYMENT_RETRY: 'bg-orange-100 text-orange-800',
  PAYMENT_REFUNDED: 'bg-cyan-100 text-cyan-800',
  PAYOUT_INITIATED: 'bg-blue-100 text-blue-800',
  PAYOUT_PROCESSED: 'bg-green-100 text-green-800',
  PAYOUT_SUCCESS: 'bg-green-100 text-green-800',
  PAYOUT_FAILED: 'bg-red-100 text-red-800',
  PAYOUT_PENDING: 'bg-yellow-100 text-yellow-800',
  PAYOUT_RETRY: 'bg-orange-100 text-orange-800',
  QUOTE_CREATED: 'bg-blue-100 text-blue-800',
  QUOTE_EXPIRED: 'bg-yellow-100 text-yellow-800',
  QUOTE_CONSUMED: 'bg-green-100 text-green-800',
  PREMIUM_DUE: 'bg-amber-100 text-amber-800',
  PREMIUM_OVERDUE: 'bg-red-100 text-red-800',
  REFUND_PROCESSED: 'bg-green-100 text-green-800',
  REFUND_FAILED: 'bg-red-100 text-red-800',
  RECONCILIATION_COMPLETED: 'bg-green-100 text-green-800',
  RECONCILIATION_DISCREPANCY: 'bg-red-100 text-red-800',
  PRICING_RULE_CREATED: 'bg-teal-100 text-teal-800',
  PRICING_RULE_UPDATED: 'bg-teal-100 text-teal-800',
  GENERAL: 'bg-gray-100 text-gray-800',
};

export const DELIVERY_STATUS_COLORS: Record<DeliveryStatus, string> = {
  DELIVERED: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  SKIPPED: 'bg-gray-100 text-gray-800',
};

export const DELIVERY_CHANNEL_LABELS: Record<string, string> = {
  IN_APP: 'In-App',
  EMAIL: 'Email',
  SMS: 'SMS',
};

export function getNotificationIcon(type: string): string {
  return NOTIFICATION_ICONS[type] || NOTIFICATION_ICONS['GENERAL'];
}

export function getNotificationColor(type: string): string {
  return NOTIFICATION_COLORS[type] || NOTIFICATION_COLORS['GENERAL'];
}

export function getDeliveryStatusColor(status: string): string {
  return DELIVERY_STATUS_COLORS[status as DeliveryStatus] || 'bg-gray-100 text-gray-800';
}

export function getDeliveryChannelLabel(channel: string): string {
  return DELIVERY_CHANNEL_LABELS[channel] || channel;
}

export function formatNotificationType(type: string): string {
  return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
}

export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function groupNotificationTypesByCategory(types: readonly NotificationType[]): {
  category: string;
  types: NotificationType[];
}[] {
  const categories: Record<string, NotificationType[]> = {};
  for (const type of types) {
    const part = type.split('_')[0];
    const category = categories[part] ?? [];
    category.push(type);
    categories[part] = category;
  }
  return Object.entries(categories).map(([category, items]) => ({ category, types: items }));
}

const IMPORTANT_NOTIFICATION_TYPES = new Set<NotificationType>([
  'POLICY_APPROVED',
  'POLICY_REJECTED',
  'POLICY_EXPIRED',
  'CLAIM_APPROVED',
  'CLAIM_REJECTED',
  'CLAIM_SETTLED',
  'CLAIM_UNDER_REVIEW',
  'CLAIM_ESCALATED',
  'CLAIM_PAYMENT_INITIATED',
  'MANUAL_CLAIM_SUBMITTED',
  'MANUAL_CLAIM_INVESTIGATION_STARTED',
  'MANUAL_CLAIM_INVESTIGATION_COMPLETED',
  'AUTOMATIC_CLAIM_CREATED',
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
  'PAYOUT_INITIATED',
  'PAYOUT_SUCCESS',
  'PAYOUT_FAILED',
  'PAYMENT_SUCCESS',
  'PAYMENT_FAILED',
  'PREMIUM_DUE',
  'PREMIUM_OVERDUE',
  'RECONCILIATION_DISCREPANCY',
]);

export function isImportantNotificationType(type: string): boolean {
  return IMPORTANT_NOTIFICATION_TYPES.has(type as NotificationType);
}

const ROLE_NOTIFICATIONS_ROUTE: Record<string, string> = {
  ROLE_CUSTOMER: '/customer/notifications',
  ROLE_UNDERWRITER: '/underwriter/notifications',
  ROLE_CLAIMS_OFFICER: '/claims-officer/notifications',
  ROLE_ADMIN: '/admin/notifications',
};

type RelatedEntityTypeValue = RelatedEntityType;

function hasRole(role: string | null | undefined, expected: string): boolean {
  return role === expected || role === `ROLE_${expected}`;
}

const RELATED_ENTITY_ROUTES: Record<RelatedEntityTypeValue, (role: string, entityId?: number | null) => string | null> = {
  POLICY: (role, id) => {
    const prefix = hasRole(role, 'ADMIN') ? '/admin/policies' : hasRole(role, 'UNDERWRITER') ? '/underwriter/policies' : '/customer/policies';
    return id ? `${prefix}/${id}` : prefix;
  },
  CLAIM: (role, id) => {
    const prefix = hasRole(role, 'ADMIN') ? '/admin/claims' : hasRole(role, 'CLAIMS_OFFICER') ? '/claims-officer/claims' : '/customer/claims';
    return id ? `${prefix}/${id}` : prefix;
  },
  TRIGGER_EVENT: (role) => (hasRole(role, 'ADMIN') ? '/admin/trigger-events' : null),
  PRODUCT: (role, id) => (hasRole(role, 'ADMIN') ? (id ? `/admin/products/${id}` : '/admin/products') : null),
  PAYMENT: () => null,
  PAYOUT: () => null,
  QUOTE: () => null,
  PRICING_RULE: () => null,
  RECONCILIATION: () => null,
  USER: () => null,
};

function notificationsRoute(role: string | null | undefined): string | null {
  if (!role) {
    return null;
  }
  const route = ROLE_NOTIFICATIONS_ROUTE[role];
  if (route) {
    return route;
  }
  const prefixes = [
    'ROLE_CUSTOMER',
    'ROLE_UNDERWRITER',
    'ROLE_CLAIMS_OFFICER',
    'ROLE_ADMIN',
  ];
  for (const key of prefixes) {
    if (hasRole(role, key.replace('ROLE_', ''))) {
      return ROLE_NOTIFICATIONS_ROUTE[key];
    }
  }
  return null;
}

export function notificationDestinationRoute(
  notification: Pick<NotificationResponse, 'relatedEntityType' | 'relatedEntityId'>,
  role?: string | null,
): string | null {
  if (!notification.relatedEntityType) {
    return notificationsRoute(role);
  }
  const resolver = RELATED_ENTITY_ROUTES[notification.relatedEntityType];
  return resolver ? resolver(role ?? '', notification.relatedEntityId) : null;
}