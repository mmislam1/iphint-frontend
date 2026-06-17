const normalizeToken = (value: string) => value.replace(/[_\s-]+/g, '').toLowerCase();

export const humanizeAdminValue = (value: string) =>
  value
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .trim();

export const getAdminStatusToken = (value: string) => {
  switch (normalizeToken(value)) {
    case 'active':
      return 'active';
    case 'inactive':
      return 'inactive';
    case 'completed':
      return 'completed';
    case 'processing':
      return 'processing';
    case 'failed':
      return 'failed';
    case 'reviewpending':
      return 'reviewPending';
    case 'notreviewed':
      return 'notReviewed';
    case 'reviewed':
      return 'reviewed';
    case 'takedownrequest':
      return 'takedownRequest';
    case 'reportinfringement':
      return 'reportInfringement';
    case 'dispute':
      return 'dispute';
    case 'legalsupportrequest':
      return 'legalSupportRequest';
    case 'underanalysis':
      return 'underAnalysis';
    case 'approved':
      return 'approved';
    case 'trialing':
      return 'trialing';
    case 'pastdue':
      return 'pastDue';
    case 'paused':
      return 'paused';
    case 'pending':
      return 'pending';
    case 'cancelled':
      return 'cancelled';
    case 'expired':
      return 'expired';
    default:
      return null;
  }
};

export const getAdminActivityToken = (value: string) => {
  switch (normalizeToken(value)) {
    case 'search':
      return 'search';
    case 'subscription':
      return 'subscription';
    case 'userjoined':
      return 'userJoined';
    case 'payment':
      return 'payment';
    default:
      return null;
  }
};