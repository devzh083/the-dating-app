# Premium Plans & Features - Seed Data

## Original Data to Add to Database

### Premium Plans (4 plans)

#### Plan 1: Monthly
```json
{
  "plan_id": "monthly",
  "name": "Monthly",
  "duration": "1 Month",
  "plan_type": "monthly",
  "price": 29.99,
  "original_price": null,
  "price_per_month": 29.99,
  "discount_text": null,
  "icon": "zap",
  "color": "from-blue-500 to-cyan-500",
  "gradient": "bg-gradient-to-br from-blue-500 to-cyan-500",
  "popular": false,
  "features": [
    "Unlimited likes",
    "See who liked you",
    "Priority matching",
    "5 Super Likes per day",
    "Boost profile once"
  ],
  "active": true,
  "display_order": 0
}
```

#### Plan 2: Quarterly (POPULAR)
```json
{
  "plan_id": "quarterly",
  "name": "Quarterly",
  "duration": "3 Months",
  "plan_type": "quarterly",
  "price": 59.99,
  "original_price": 89.97,
  "price_per_month": 19.99,
  "discount_text": "Save 33%",
  "icon": "flame",
  "color": "from-teal-500 to-emerald-500",
  "gradient": "bg-gradient-to-br from-teal-500 to-emerald-500",
  "popular": true,
  "features": [
    "Everything in Monthly",
    "10 Super Likes per day",
    "Boost profile twice/week",
    "Advanced filters",
    "Read receipts",
    "Profile insights"
  ],
  "active": true,
  "display_order": 1
}
```

#### Plan 3: 6 Months (Biannual)
```json
{
  "plan_id": "biannual",
  "name": "6 Months",
  "duration": "6 Months",
  "plan_type": "biannual",
  "price": 99.99,
  "original_price": 179.94,
  "price_per_month": 16.66,
  "discount_text": "Save 44%",
  "icon": "trending-up",
  "color": "from-emerald-500 to-green-500",
  "gradient": "bg-gradient-to-br from-emerald-500 to-green-500",
  "popular": false,
  "features": [
    "Everything in Quarterly",
    "Unlimited Super Likes",
    "Daily profile boost",
    "Priority support",
    "Exclusive badges",
    "Ghost mode"
  ],
  "active": true,
  "display_order": 2
}
```

#### Plan 4: Annual
```json
{
  "plan_id": "annual",
  "name": "Annual",
  "duration": "12 Months",
  "plan_type": "annual",
  "price": 149.99,
  "original_price": 359.88,
  "price_per_month": 12.49,
  "discount_text": "Save 58%",
  "icon": "crown",
  "color": "from-purple-500 to-pink-500",
  "gradient": "bg-gradient-to-br from-purple-500 to-pink-500",
  "popular": false,
  "features": [
    "Everything in 6 Months",
    "VIP profile highlighting",
    "Unlimited rewinds",
    "Travel mode",
    "Exclusive events access",
    "Premium badge",
    "Profile verification"
  ],
  "active": true,
  "display_order": 3
}
```

---

### Premium Features (6 features)

#### Feature 1: See Who Likes You
```json
{
  "id": 1,
  "title": "See Who Likes You",
  "description": "Skip the guessing game. Instantly see everyone who's interested.",
  "icon": "eye",
  "active": true,
  "display_order": 0
}
```

#### Feature 2: Boost Your Profile
```json
{
  "id": 2,
  "title": "Boost Your Profile",
  "description": "Be the top profile in your area for 30 minutes. Get 10x more matches.",
  "icon": "zap",
  "active": true,
  "display_order": 1
}
```

#### Feature 3: Priority Matching
```json
{
  "id": 3,
  "title": "Priority Matching",
  "description": "Your profile gets shown first. Stand out from the crowd.",
  "icon": "message-circle",
  "active": true,
  "display_order": 2
}
```

#### Feature 4: Travel Mode
```json
{
  "id": 4,
  "title": "Travel Mode",
  "description": "Connect with people before you arrive. Perfect for frequent travelers.",
  "icon": "map-pin",
  "active": true,
  "display_order": 3
}
```

#### Feature 5: Enhanced Privacy
```json
{
  "id": 5,
  "title": "Enhanced Privacy",
  "description": "Control who sees you. Browse anonymously with Ghost Mode.",
  "icon": "shield",
  "active": true,
  "display_order": 4
}
```

#### Feature 6: Super Likes
```json
{
  "id": 6,
  "title": "Super Likes",
  "description": "Make a powerful first impression that can't be ignored.",
  "icon": "star",
  "active": true,
  "display_order": 5
}
```

---

## SQL Insert Statements (if using SQL database)

### For Plans Table:

```sql
-- Insert Monthly Plan
INSERT INTO premium_plans (plan_id, name, duration, plan_type, price, original_price, price_per_month, discount_text, icon, color, gradient, popular, features, active, display_order)
VALUES (
  'monthly',
  'Monthly',
  '1 Month',
  'monthly',
  29.99,
  NULL,
  29.99,
  NULL,
  'zap',
  'from-blue-500 to-cyan-500',
  'bg-gradient-to-br from-blue-500 to-cyan-500',
  false,
  '["Unlimited likes", "See who liked you", "Priority matching", "5 Super Likes per day", "Boost profile once"]',
  true,
  0
);

-- Insert Quarterly Plan (Popular)
INSERT INTO premium_plans (plan_id, name, duration, plan_type, price, original_price, price_per_month, discount_text, icon, color, gradient, popular, features, active, display_order)
VALUES (
  'quarterly',
  'Quarterly',
  '3 Months',
  'quarterly',
  59.99,
  89.97,
  19.99,
  'Save 33%',
  'flame',
  'from-teal-500 to-emerald-500',
  'bg-gradient-to-br from-teal-500 to-emerald-500',
  true,
  '["Everything in Monthly", "10 Super Likes per day", "Boost profile twice/week", "Advanced filters", "Read receipts", "Profile insights"]',
  true,
  1
);

-- Insert Biannual Plan
INSERT INTO premium_plans (plan_id, name, duration, plan_type, price, original_price, price_per_month, discount_text, icon, color, gradient, popular, features, active, display_order)
VALUES (
  'biannual',
  '6 Months',
  '6 Months',
  'biannual',
  99.99,
  179.94,
  16.66,
  'Save 44%',
  'trending-up',
  'from-emerald-500 to-green-500',
  'bg-gradient-to-br from-emerald-500 to-green-500',
  false,
  '["Everything in Quarterly", "Unlimited Super Likes", "Daily profile boost", "Priority support", "Exclusive badges", "Ghost mode"]',
  true,
  2
);

-- Insert Annual Plan
INSERT INTO premium_plans (plan_id, name, duration, plan_type, price, original_price, price_per_month, discount_text, icon, color, gradient, popular, features, active, display_order)
VALUES (
  'annual',
  'Annual',
  '12 Months',
  'annual',
  149.99,
  359.88,
  12.49,
  'Save 58%',
  'crown',
  'from-purple-500 to-pink-500',
  'bg-gradient-to-br from-purple-500 to-pink-500',
  false,
  '["Everything in 6 Months", "VIP profile highlighting", "Unlimited rewinds", "Travel mode", "Exclusive events access", "Premium badge", "Profile verification"]',
  true,
  3
);
```

### For Features Table:

```sql
-- Insert Feature 1
INSERT INTO premium_features (title, description, icon, active, display_order)
VALUES (
  'See Who Likes You',
  'Skip the guessing game. Instantly see everyone who''s interested.',
  'eye',
  true,
  0
);

-- Insert Feature 2
INSERT INTO premium_features (title, description, icon, active, display_order)
VALUES (
  'Boost Your Profile',
  'Be the top profile in your area for 30 minutes. Get 10x more matches.',
  'zap',
  true,
  1
);

-- Insert Feature 3
INSERT INTO premium_features (title, description, icon, active, display_order)
VALUES (
  'Priority Matching',
  'Your profile gets shown first. Stand out from the crowd.',
  'message-circle',
  true,
  2
);

-- Insert Feature 4
INSERT INTO premium_features (title, description, icon, active, display_order)
VALUES (
  'Travel Mode',
  'Connect with people before you arrive. Perfect for frequent travelers.',
  'map-pin',
  true,
  3
);

-- Insert Feature 5
INSERT INTO premium_features (title, description, icon, active, display_order)
VALUES (
  'Enhanced Privacy',
  'Control who sees you. Browse anonymously with Ghost Mode.',
  'shield',
  true,
  4
);

-- Insert Feature 6
INSERT INTO premium_features (title, description, icon, active, display_order)
VALUES (
  'Super Likes',
  'Make a powerful first impression that can''t be ignored.',
  'star',
  true,
  5
);
```

---

## Django Management Command (Python)

If you're using Django, here's a management command to seed the data:

```python
# management/commands/seed_premium_data.py

from django.core.management.base import BaseCommand
from your_app.models import PremiumPlan, PremiumFeature

class Command(BaseCommand):
    help = 'Seeds premium plans and features'

    def handle(self, *args, **kwargs):
        # Clear existing data (optional)
        # PremiumPlan.objects.all().delete()
        # PremiumFeature.objects.all().delete()

        # Create Plans
        plans_data = [
            {
                "plan_id": "monthly",
                "name": "Monthly",
                "duration": "1 Month",
                "plan_type": "monthly",
                "price": 29.99,
                "price_per_month": 29.99,
                "icon": "zap",
                "color": "from-blue-500 to-cyan-500",
                "gradient": "bg-gradient-to-br from-blue-500 to-cyan-500",
                "popular": False,
                "features": [
                    "Unlimited likes",
                    "See who liked you",
                    "Priority matching",
                    "5 Super Likes per day",
                    "Boost profile once"
                ],
                "active": True,
                "display_order": 0
            },
            {
                "plan_id": "quarterly",
                "name": "Quarterly",
                "duration": "3 Months",
                "plan_type": "quarterly",
                "price": 59.99,
                "original_price": 89.97,
                "price_per_month": 19.99,
                "discount_text": "Save 33%",
                "icon": "flame",
                "color": "from-teal-500 to-emerald-500",
                "gradient": "bg-gradient-to-br from-teal-500 to-emerald-500",
                "popular": True,
                "features": [
                    "Everything in Monthly",
                    "10 Super Likes per day",
                    "Boost profile twice/week",
                    "Advanced filters",
                    "Read receipts",
                    "Profile insights"
                ],
                "active": True,
                "display_order": 1
            },
            {
                "plan_id": "biannual",
                "name": "6 Months",
                "duration": "6 Months",
                "plan_type": "biannual",
                "price": 99.99,
                "original_price": 179.94,
                "price_per_month": 16.66,
                "discount_text": "Save 44%",
                "icon": "trending-up",
                "color": "from-emerald-500 to-green-500",
                "gradient": "bg-gradient-to-br from-emerald-500 to-green-500",
                "popular": False,
                "features": [
                    "Everything in Quarterly",
                    "Unlimited Super Likes",
                    "Daily profile boost",
                    "Priority support",
                    "Exclusive badges",
                    "Ghost mode"
                ],
                "active": True,
                "display_order": 2
            },
            {
                "plan_id": "annual",
                "name": "Annual",
                "duration": "12 Months",
                "plan_type": "annual",
                "price": 149.99,
                "original_price": 359.88,
                "price_per_month": 12.49,
                "discount_text": "Save 58%",
                "icon": "crown",
                "color": "from-purple-500 to-pink-500",
                "gradient": "bg-gradient-to-br from-purple-500 to-pink-500",
                "popular": False,
                "features": [
                    "Everything in 6 Months",
                    "VIP profile highlighting",
                    "Unlimited rewinds",
                    "Travel mode",
                    "Exclusive events access",
                    "Premium badge",
                    "Profile verification"
                ],
                "active": True,
                "display_order": 3
            }
        ]

        for plan_data in plans_data:
            PremiumPlan.objects.create(**plan_data)
            self.stdout.write(self.style.SUCCESS(f'Created plan: {plan_data["name"]}'))

        # Create Features
        features_data = [
            {
                "title": "See Who Likes You",
                "description": "Skip the guessing game. Instantly see everyone who's interested.",
                "icon": "eye",
                "active": True,
                "display_order": 0
            },
            {
                "title": "Boost Your Profile",
                "description": "Be the top profile in your area for 30 minutes. Get 10x more matches.",
                "icon": "zap",
                "active": True,
                "display_order": 1
            },
            {
                "title": "Priority Matching",
                "description": "Your profile gets shown first. Stand out from the crowd.",
                "icon": "message-circle",
                "active": True,
                "display_order": 2
            },
            {
                "title": "Travel Mode",
                "description": "Connect with people before you arrive. Perfect for frequent travelers.",
                "icon": "map-pin",
                "active": True,
                "display_order": 3
            },
            {
                "title": "Enhanced Privacy",
                "description": "Control who sees you. Browse anonymously with Ghost Mode.",
                "icon": "shield",
                "active": True,
                "display_order": 4
            },
            {
                "title": "Super Likes",
                "description": "Make a powerful first impression that can't be ignored.",
                "icon": "star",
                "active": True,
                "display_order": 5
            }
        ]

        for feature_data in features_data:
            PremiumFeature.objects.create(**feature_data)
            self.stdout.write(self.style.SUCCESS(f'Created feature: {feature_data["title"]}'))

        self.stdout.write(self.style.SUCCESS('Successfully seeded premium data!'))
```

Run with: `python manage.py seed_premium_data`

---

## Quick Import via Admin Panel

You can also manually add these through your Premium Management admin panel by clicking "Add New Plan" or "Add New Feature" and entering the data above!

## Icon Options Reference

Valid icon values:
- `zap` - Lightning bolt
- `flame` - Fire icon
- `trending-up` - Trending arrow
- `crown` - Crown icon
- `star` - Star icon
- `eye` - Eye icon
- `map-pin` - Location pin
- `message-circle` - Chat bubble
- `shield` - Shield icon

## Gradient Options Reference

Valid gradient values:
- `bg-gradient-to-br from-blue-500 to-cyan-500` - Blue to Cyan
- `bg-gradient-to-br from-teal-500 to-emerald-500` - Teal to Emerald
- `bg-gradient-to-br from-emerald-500 to-green-500` - Emerald to Green
- `bg-gradient-to-br from-purple-500 to-pink-500` - Purple to Pink
- `bg-gradient-to-br from-orange-500 to-red-500` - Orange to Red
