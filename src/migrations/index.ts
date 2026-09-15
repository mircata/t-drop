import * as migration_20260912_025317_initial from './20260912_025317_initial';
import * as migration_20260912_025706_content from './20260912_025706_content';
import * as migration_20260912_031137_customers from './20260912_031137_customers';
import * as migration_20260912_031702_subscriptions from './20260912_031702_subscriptions';
import * as migration_20260912_032229_stripe from './20260912_032229_stripe';
import * as migration_20260912_032654_newsletter from './20260912_032654_newsletter';
import * as migration_20260913_052405_payments_subscription_link from './20260913_052405_payments_subscription_link';
import * as migration_20260915_003600_delivery_day from './20260915_003600_delivery_day';
import * as migration_20260915_150000_category_selection_size_gender from './20260915_150000_category_selection_size_gender';
import * as migration_20260915_151500_customer_shipping from './20260915_151500_customer_shipping';
import * as migration_20260915_160000_fulfillment_status from './20260915_160000_fulfillment_status';

export const migrations = [
  {
    up: migration_20260912_025317_initial.up,
    down: migration_20260912_025317_initial.down,
    name: '20260912_025317_initial',
  },
  {
    up: migration_20260912_025706_content.up,
    down: migration_20260912_025706_content.down,
    name: '20260912_025706_content',
  },
  {
    up: migration_20260912_031137_customers.up,
    down: migration_20260912_031137_customers.down,
    name: '20260912_031137_customers',
  },
  {
    up: migration_20260912_031702_subscriptions.up,
    down: migration_20260912_031702_subscriptions.down,
    name: '20260912_031702_subscriptions',
  },
  {
    up: migration_20260912_032229_stripe.up,
    down: migration_20260912_032229_stripe.down,
    name: '20260912_032229_stripe',
  },
  {
    up: migration_20260912_032654_newsletter.up,
    down: migration_20260912_032654_newsletter.down,
    name: '20260912_032654_newsletter',
  },
  {
    up: migration_20260913_052405_payments_subscription_link.up,
    down: migration_20260913_052405_payments_subscription_link.down,
    name: '20260913_052405_payments_subscription_link'
  },
  {
    up: migration_20260915_003600_delivery_day.up,
    down: migration_20260915_003600_delivery_day.down,
    name: '20260915_003600_delivery_day'
  },
  {
    up: migration_20260915_150000_category_selection_size_gender.up,
    down: migration_20260915_150000_category_selection_size_gender.down,
    name: '20260915_150000_category_selection_size_gender'
  },
  {
    up: migration_20260915_151500_customer_shipping.up,
    down: migration_20260915_151500_customer_shipping.down,
    name: '20260915_151500_customer_shipping'
  },
  {
    up: migration_20260915_160000_fulfillment_status.up,
    down: migration_20260915_160000_fulfillment_status.down,
    name: '20260915_160000_fulfillment_status'
  },
];
