from datetime import date

from django.contrib.auth.models import User
from django.core.management import call_command
from django.core.management.base import BaseCommand

from admin_panel.models import PremiumPlan, PremiumFeature, ExpertTip, Review
from profiles.models import UserProfile

DEMO_PASSWORD = "DemoPass123!"

DEMO_PROFILES = [
    dict(username="arjun.demo@example.com", first_name="Arjun", gender="Man", interested_in=["Women"],
         dob="1997-03-14", location="Hyderabad", drinking="Socially", smoking="Never", workout="Often", pets="Love pets",
         interests=["Travel", "Photography", "Hiking"], bio="Chasing sunsets and good conversations.",
         conversation_starter="What's the best trip you've ever taken?",
         photos=["https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=800&fit=crop"]),
    dict(username="maya.demo@example.com", first_name="Maya", gender="Woman", interested_in=["Men"],
         dob="1998-07-22", location="Hyderabad", drinking="Socially", smoking="Never", workout="Sometimes", pets="Own pets",
         interests=["Coffee", "Books", "Music"], bio="Coffee enthusiast, part-time bookworm.",
         conversation_starter="Last book that kept you up all night?",
         photos=["https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=800&fit=crop"]),
    dict(username="dev.demo@example.com", first_name="Dev", gender="Man", interested_in=["Women"],
         dob="1996-11-02", location="Bengaluru", drinking="Never", smoking="Never", workout="Daily", pets="Allergic",
         interests=["Tech", "Gym", "Gaming"], bio="Building things by day, gaming by night.",
         conversation_starter="PC or console?",
         photos=["https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&h=800&fit=crop"]),
    dict(username="zara.demo@example.com", first_name="Zara", gender="Woman", interested_in=["Men"],
         dob="1999-01-30", location="Bengaluru", drinking="Socially", smoking="Sometimes", workout="Sometimes", pets="Love pets",
         interests=["Dance", "Fashion", "Travel"], bio="Always up for a spontaneous road trip.",
         conversation_starter="Where's your dream vacation?",
         photos=["https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&h=800&fit=crop"]),
    dict(username="kabir.demo@example.com", first_name="Kabir", gender="Man", interested_in=["Women"],
         dob="1995-09-18", location="Hyderabad", drinking="Regularly", smoking="Never", workout="Often", pets="None",
         interests=["Music", "Art", "Travel"], bio="Guitarist looking for my harmony.",
         conversation_starter="What song is stuck in your head right now?",
         photos=["https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&h=800&fit=crop"]),
    dict(username="riya.demo@example.com", first_name="Riya", gender="Woman", interested_in=["Men"],
         dob="1997-05-09", location="Hyderabad", drinking="Socially", smoking="Never", workout="Often", pets="Own pets",
         interests=["Foodie", "Travel", "Photography"], bio="Will travel far for good food.",
         conversation_starter="Best meal you've ever had?",
         photos=["https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=800&fit=crop"]),
    dict(username="aisha.demo@example.com", first_name="Aisha", gender="Woman", interested_in=["Men", "Women"],
         dob="1998-12-05", location="Mumbai", drinking="Socially", smoking="Never", workout="Sometimes", pets="Love pets",
         interests=["Art", "Books", "Music"], bio="Painter, dreamer, tea addict.",
         conversation_starter="Tea or coffee?",
         photos=["https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=800&fit=crop"]),
    dict(username="rohan.demo@example.com", first_name="Rohan", gender="Man", interested_in=["Women"],
         dob="1994-06-27", location="Mumbai", drinking="Socially", smoking="Never", workout="Daily", pets="None",
         interests=["Gym", "Travel", "Tech"], bio="Fitness first, everything else follows.",
         conversation_starter="Morning workout or evening workout?",
         photos=["https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&h=800&fit=crop"]),
    dict(username="priya.demo@example.com", first_name="Priya", gender="Woman", interested_in=["Men"],
         dob="1996-02-14", location="Hyderabad", drinking="Never", smoking="Never", workout="Often", pets="Own pets",
         interests=["Hiking", "Books", "Coffee"], bio="Mountains over malls, always.",
         conversation_starter="Best hiking trail you've done?",
         photos=["https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=600&h=800&fit=crop"]),
    dict(username="vikram.demo@example.com", first_name="Vikram", gender="Man", interested_in=["Women"],
         dob="1993-10-11", location="Bengaluru", drinking="Socially", smoking="Never", workout="Sometimes", pets="Love pets",
         interests=["Music", "Foodie", "Gaming"], bio="DJ on weekends, foodie every day.",
         conversation_starter="What's your go-to karaoke song?",
         photos=["https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=600&h=800&fit=crop"]),
]

EXPERT_TIPS = [
    dict(name="Dr. Neha Kapoor", role="Relationship Psychologist", tip="Ask open-ended questions early — 'What made you smile today?' opens up far more than 'How are you?'", icon="message-circle", icon_color="text-blue-500", bg_color="bg-blue-50"),
    dict(name="Aman Verma", role="Dating Coach", tip="A great bio isn't a resume — it's an invitation to ask a question. Leave something unanswered on purpose.", icon="lightbulb", icon_color="text-amber-500", bg_color="bg-amber-50"),
    dict(name="Dr. Sarah Lee", role="Behavioral Therapist", tip="First dates go better with an activity, not just a coffee and small talk — shared novelty builds connection faster.", icon="sparkles", icon_color="text-violet-500", bg_color="bg-violet-50"),
    dict(name="Ravi Menon", role="Matchmaker", tip="Photos with genuine, mid-laugh expressions consistently outperform posed studio shots.", icon="heart", icon_color="text-rose-500", bg_color="bg-rose-50"),
]

DEMO_REVIEWS = [
    (5, "Matched with someone whose interests actually lined up with mine — first app where that's felt real."),
    (5, "The cafe booking feature is such a good idea for a first date, no more awkward 'where should we meet' texts."),
    (4, "Clean interface, and I like that profiles stay anonymous until you actually match."),
    (5, "Got a 20% discount booking a table with my match. Small thing but a nice touch."),
    (4, "Matching felt more thoughtful than just swiping on photos."),
]


class Command(BaseCommand):
    help = "Seeds demo profiles, premium plans, expert tips, reviews, and cafes for a populated portfolio demo."

    def handle(self, *args, **options):
        self._seed_profiles()
        self._seed_premium()
        self._seed_expert_tips()
        self._seed_reviews()
        call_command("seed_cafes")
        self.stdout.write(self.style.SUCCESS(f"\nDemo login password for all seeded profiles: {DEMO_PASSWORD}"))

    def _seed_profiles(self):
        created = 0
        for data in DEMO_PROFILES:
            user, was_created = User.objects.get_or_create(
                username=data["username"],
                defaults={"email": data["username"]},
            )
            if was_created:
                user.set_password(DEMO_PASSWORD)
                user.save()
                created += 1

            UserProfile.objects.update_or_create(
                user=user,
                defaults=dict(
                    email=data["username"],
                    first_name=data["first_name"],
                    date_of_birth=date.fromisoformat(data["dob"]),
                    gender=data["gender"],
                    interested_in=data["interested_in"],
                    location=data["location"],
                    drinking=data["drinking"],
                    smoking=data["smoking"],
                    workout=data["workout"],
                    pets=data["pets"],
                    interests=data["interests"],
                    bio=data["bio"],
                    conversation_starter=data["conversation_starter"],
                    photos=data["photos"],
                    email_verified=True,
                ),
            )
        self.stdout.write(self.style.SUCCESS(f"Seeded {created} new demo profile(s); {len(DEMO_PROFILES) - created} already existed."))

    def _seed_premium(self):
        plans = [
            dict(plan_id="monthly", name="Monthly", duration="1 Month", plan_type="monthly",
                 price=299, price_per_month=299, icon="zap", gradient="bg-gradient-to-br from-blue-500 to-cyan-500",
                 popular=False, display_order=0,
                 features=["Unlimited likes", "See who liked you", "Priority matching", "5 Super Likes per day", "Boost profile once"]),
            dict(plan_id="quarterly", name="Quarterly", duration="3 Months", plan_type="quarterly",
                 price=599, original_price=897, price_per_month=199.67, discount_text="Save 33%",
                 icon="flame", gradient="bg-gradient-to-br from-teal-500 to-emerald-500", popular=True, display_order=1,
                 features=["Everything in Monthly", "10 Super Likes per day", "Boost profile twice/week", "Advanced filters", "Read receipts"]),
            dict(plan_id="biannual", name="6 Months", duration="6 Months", plan_type="biannual",
                 price=999, original_price=1794, price_per_month=166.5, discount_text="Save 44%",
                 icon="trending-up", gradient="bg-gradient-to-br from-emerald-500 to-green-500", popular=False, display_order=2,
                 features=["Everything in Quarterly", "Unlimited Super Likes", "Daily profile boost", "Priority support", "Ghost mode"]),
            dict(plan_id="annual", name="Annual", duration="12 Months", plan_type="annual",
                 price=1499, original_price=3588, price_per_month=124.92, discount_text="Save 58%",
                 icon="crown", gradient="bg-gradient-to-br from-purple-500 to-pink-500", popular=False, display_order=3,
                 features=["Everything in 6 Months", "VIP profile highlighting", "Unlimited rewinds", "Travel mode", "Premium badge"]),
        ]
        created = 0
        for plan in plans:
            _, was_created = PremiumPlan.objects.get_or_create(plan_id=plan["plan_id"], defaults=plan)
            created += int(was_created)

        features = [
            dict(title="See Who Likes You", description="Skip the guessing game. Instantly see everyone who's interested.", icon="eye", display_order=0),
            dict(title="Boost Your Profile", description="Be the top profile in your area for 30 minutes.", icon="zap", display_order=1),
            dict(title="Priority Matching", description="Your profile gets shown first. Stand out from the crowd.", icon="message-circle", display_order=2),
            dict(title="Travel Mode", description="Connect with people before you arrive.", icon="map-pin", display_order=3),
            dict(title="Enhanced Privacy", description="Browse anonymously with Ghost Mode.", icon="shield", display_order=4),
            dict(title="Super Likes", description="Make a powerful first impression that can't be ignored.", icon="star", display_order=5),
        ]
        for feature in features:
            PremiumFeature.objects.get_or_create(title=feature["title"], defaults=feature)

        self.stdout.write(self.style.SUCCESS(f"Seeded {created} new premium plan(s) and ensured 6 features exist."))

    def _seed_expert_tips(self):
        created = 0
        for tip in EXPERT_TIPS:
            _, was_created = ExpertTip.objects.get_or_create(name=tip["name"], defaults={**tip, "image": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop"})
            created += int(was_created)
        self.stdout.write(self.style.SUCCESS(f"Seeded {created} new expert tip(s)."))

    def _seed_reviews(self):
        created = 0
        demo_users = list(User.objects.filter(username__in=[p["username"] for p in DEMO_PROFILES]))
        for (rating, text), user in zip(DEMO_REVIEWS, demo_users):
            _, was_created = Review.objects.get_or_create(
                user=user, text=text,
                defaults={"rating": rating, "status": "approved"},
            )
            created += int(was_created)
        self.stdout.write(self.style.SUCCESS(f"Seeded {created} new review(s)."))
