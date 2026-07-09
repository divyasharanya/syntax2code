from django.db import migrations
from django.contrib.auth.hashers import make_password

def seed_data(apps, schema_editor):
    CustomUser = apps.get_model('api', 'CustomUser')
    Task = apps.get_model('api', 'Task')
    Application = apps.get_model('api', 'Application')
    Submission = apps.get_model('api', 'Submission')

    # 1. Admin
    CustomUser.objects.create(
        username='admin@microintern.com',
        email='admin@microintern.com',
        password=make_password('adminpassword'),
        first_name='Platform Admin',
        role='admin',
        is_staff=True,
        is_superuser=True
    )

    # 2. Candidate Alex Rivera
    alex = CustomUser.objects.create(
        username='candidate@microintern.com',
        email='candidate@microintern.com',
        password=make_password('password'),
        first_name='Alex Rivera',
        role='candidate',
        title='Frontend Engineer',
        bio='Passionate developer specializing in React, Next.js, and CSS animations. Building responsive and highly aesthetic user interfaces.',
        skills=['React', 'JavaScript', 'Tailwind CSS', 'CSS v4', 'Node.js', 'Git'],
        portfolio_url='https://github.com/alexrivera',
        avatar='https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        points=350
    )

    # 3. Companies
    stripe = CustomUser.objects.create(
        username='company@stripe.com',
        email='company@stripe.com',
        password=make_password('password'),
        first_name='Sarah Chen',
        role='company',
        company_name='Stripe',
        company_logo='https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
        company_url='https://stripe.com',
        bio='Stripe is a financial infrastructure platform for the internet. Millions of companies use Stripe to accept payments and manage their businesses.'
    )

    spotify = CustomUser.objects.create(
        username='recruiter@spotify.com',
        email='recruiter@spotify.com',
        password=make_password('password'),
        first_name='Spotify Recruiter',
        role='company',
        company_name='Spotify',
        company_logo='https://images.unsplash.com/photo-1614680376593-902f74fa0d41?w=150&auto=format&fit=crop&q=80',
        company_url='https://spotify.com'
    )

    airbnb = CustomUser.objects.create(
        username='recruiter@airbnb.com',
        email='recruiter@airbnb.com',
        password=make_password('password'),
        first_name='Airbnb Recruiter',
        role='company',
        company_name='Airbnb',
        company_logo='https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=150&auto=format&fit=crop&q=80',
        company_url='https://airbnb.com'
    )

    # 4. Tasks
    task1 = Task.objects.create(
        company=stripe,
        title='Stripe Custom Checkout Flow',
        difficulty='Intermediate',
        duration='4h',
        reward=150,
        tags=['React', 'Tailwind CSS', 'Stripe API'],
        description="""### Objective
Create a custom subscription payment flow with a clean UI, multi-tiered plan selection (Starter, Pro, Enterprise), and instant feedback upon successful/failed transactions.

### Requirements
1. **Plan Selection UI**: Users can toggle between monthly/yearly pricing and select a plan.
2. **Mock Payment Form**: Build a credit card form checking basic validity (Luhn algorithm or simple lengths).
3. **Success/Error States**: Show beautiful, animated alerts depending on the card number inputted:
   - Card ending in `4242` -> Success screen
   - Card ending in `0000` -> Declined message
4. **Clean Code**: Well-structured React components, reusable inputs.

### Deliverables
- A GitHub repository link containing the code.
- A live deployment URL (e.g., Vercel, Netlify).
- Self-evaluation notes explaining your design decisions.""",
        status='open'
    )

    task2 = Task.objects.create(
        company=spotify,
        title='Spotify Playback Controller Widget',
        difficulty='Easy',
        duration='2h',
        reward=100,
        tags=['React', 'CSS Animations', 'Audio API'],
        description="""### Objective
Design and implement an interactive music playback widget that fetches and controls track information. Use local audio files or mock data to simulate playback progress, cover art transitions, and sound wave animations.

### Requirements
1. **Interactive Controls**: Play, pause, skip, seek slider, and volume control.
2. **Dynamic UI**: Theme colors should adapt based on the cover art's primary colors (glassmorphic aesthetic).
3. **Sound Wave Animation**: Smooth CSS or SVG wave animations that bounce in sync with playback.
4. **Responsive Layout**: Adapts from sidebar width to full desktop viewports.""",
        status='open'
    )

    task3 = Task.objects.create(
        company=airbnb,
        title='Airbnb-Style Interactive Map Search',
        difficulty='Advanced',
        duration='8h',
        reward=280,
        tags=['React', 'Leaflet', 'Flexbox'],
        description="""### Objective
Build a split-pane interface with search filters on the left and a mock interactive map on the right. Clicking properties on the list highlights pins on the map, and hovering map pins opens preview cards.

### Requirements
1. **Split-Screen Design**: Fixed layout with scrollable results and persistent map space.
2. **Interactive Map**: Mock map using Leaflet, Mapbox, or custom Interactive SVG representing properties.
3. **Filter System**: Filter by price, rooms, and features in real-time.
4. **Smooth Transitions**: Smooth CSS animations for map pin states.""",
        status='open'
    )

    # 5. Applications & Submissions
    app1 = Application.objects.create(task=task2, candidate=alex, status='Shortlisted')
    Submission.objects.create(
        application=app1,
        github_url='https://github.com/alexrivera/spotify-widget-challenge',
        live_url='https://spotify-widget-challenge.vercel.app',
        notes='Implemented a custom SVG soundwave that reacts to playback state. Added full responsive design and keyboard hotkeys (Space to toggle play/pause). Used Tailwind CSS v4 styling!',
        feedback='Fantastic implementation! The custom SVG animation and fluid transitions were superb. You clearly have a strong grasp of Tailwind CSS and layout engineering.',
        score=95
    )

    app2 = Application.objects.create(task=task1, candidate=alex, status='Applied')
    Submission.objects.create(
        application=app2,
        github_url='https://github.com/alexrivera/stripe-checkout-internship',
        live_url='https://stripe-checkout-internship.vercel.app',
        notes='Used Tailwind CSS v4 for absolute layout flexibility. Handles responsive grids. Included Luhn validation checks on client form.',
        feedback='',
        score=None
    )

def remove_seeded_data(apps, schema_editor):
    CustomUser = apps.get_model('api', 'CustomUser')
    CustomUser.objects.all().delete()

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_data, reverse_code=remove_seeded_data),
    ]
