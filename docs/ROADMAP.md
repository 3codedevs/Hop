# Hop: product, workflows and roadmap

Hop helps people in Lagos choose the best way across the city for the hour they leave. It compares BRT, trains, danfo, keke, ride-hailing and self-drive rental, and it rents cars, with or without a driver, when a car is the better deal.

This document covers what the demo does today, how each workflow should work, and what we plan to build next.

---

## 1. Accounts

**One account for everyone.** A person who plans trips can also rent a car and list their own car. Car owners in Lagos are often commuters themselves: they take the BRT to work while their car sits at home. A separate "owner account" would only add friction, so listing a car is something any account can do. Airbnb works the same way, where any guest can also host.

| Who | What they can do | How |
|---|---|---|
| Any account | Plan trips, rent cars, book a car with a driver, list their own car, earn from it | Same login, same app |
| Hop staff | Approve listings, handle disputes, watch the business | A separate staff role, never mixed with a customer account |

Verification is per action, not per account type:
- To plan trips: no verification.
- To drive a rented car, or list your own: ID and driver’s licence check.
- To book a car with a driver: no licence needed.

---

## 2. What the demo does today

| Area | Working now | Shown as "Soon" |
|---|---|---|
| Plan a trip | Pick places and a leave time. Get BRT, rail, danfo, keke, ride-hail and self-drive ranked by best, cheapest or fastest, with a reason, savings over a ride, and step-by-step legs on real roads | Start trip, best time to leave, save route, report a problem |
| Live map | Hop’s own map in light and dark, with BRT and rail lines, danfo routes, stations, landmarks, and simulated traffic you can scrub from 05:00 to 23:00. The main corridors show both directions | Report traffic |
| Rent | 8 cars with real photos, drive yourself or with a driver, filters, price breakdown, fuel estimate, trust badges | Booking, payment, ID check, messaging owners |
| Trips | Recent searches | Bookings, saved routes |
| Account | Single account, appearance (auto, light, dark), staff view with demo figures, reset demo | Listing a car, payouts, saved places, cards, notifications, languages |

Under the hood:
- **API:** `/api/plan`, `/api/places`, `/api/network` and `/api/cars`, running as Vercel Functions.
- **Road shapes:** real OpenStreetMap routes for 595 place pairs.
- **Traffic:** a simulated traffic model. It is tidal, towards the Island in the morning and back to the mainland in the evening.

---

## 3. Workflows

### 3.1 Plan a trip (built)
1. Choose a start and a destination, a leave time, and best, cheapest or fastest.
2. Hop ranks every way across and explains the winner, for example: “Gridlock at 08:00. The train runs clear of it, so you arrive about 56 minutes sooner than a ride and save about ₦10,600.”
3. Open an option to see each leg: where to board, what the bus calls out, fares and time.
4. Share the trip link.

### 3.2 Live trip with rerouting (next)
1. Tap **Start trip**. Hop follows your progress leg by leg.
2. Hop checks traffic every few minutes. If a road on your route jams, it offers the next best route: “Third Mainland is jammed. Take Carter Bridge and save 18 minutes.”
3. Accept with one tap. The map and the steps update.
4. On arrival, Hop shows the time and money you saved.

For demos, a **Simulate a jam** control triggers the reroute on cue, labelled as simulated.

### 3.3 Best time to leave (next)
Hop compares leaving at different times around your chosen one and suggests: “Leave at 08:40 instead of 08:00 and save 25 minutes.”

### 3.4 Rent a car (partly built)
1. Browse the cars and choose drive yourself or with a driver.
2. Pick the days. Hop shows the car price, driver fee, refundable deposit and a fuel estimate. Fuel is full to full and paid by the renter.
3. **Drive yourself:** verify your ID and licence automatically through Dojah. This checks the licence with FRSC and matches your selfie to it. Only mismatches go to Hop staff.
4. Pay the deposit and rental through Paystack.
5. At pickup and return, both sides log photos. The deposit is refunded within 48 hours of a clean return.

### 3.5 List my car (next)
1. From **Account → Your cars**, add photos, details, a daily price and the days it is free.
2. Verify your ID and licence, and upload the car’s papers.
3. Hop staff approve the listing. The car appears in Rent.
4. Accept or decline requests, log pickup and return photos, and get paid to your bank account.

### 3.6 Staff (next)
- **Dashboard:** bookings, revenue, verification queue, flagged listings, traffic reports and popular routes.
- **Approvals:** review mismatched ID checks and new listings.
- **Disputes:** damage claims, using the pickup and return photos.

---

## 4. Future feature: Hop Daily, a driver for your commute

**The idea:** a driver picks you up every morning, drops you at work, and brings you home in the evening. It is not a whole-day chauffeur or a one-off ride-hail. It is a recurring commute that books itself.

**Why it fits Lagos:**
- Ride-hailing at rush hour is expensive and unreliable: surge pricing, cancellations, and drivers refusing long trips across the bridges.
- Hiring a full-time driver costs a monthly salary.
- Hop Daily sits in between. It is predictable, cheaper than ride-hailing every day, and you get the same trusted driver.

**Rider workflow**
1. Set home, work and your working days, for example Monday to Friday.
2. Choose an arrival time (“at work by 08:30”) and an optional return time.
3. Hop quotes a weekly or monthly price and matches you with a vetted driver near your route. You meet the same driver every day.
4. Hop’s traffic engine moves the pickup time each morning so you still arrive on time: “Third Mainland is heavy today, so pickup is at 06:55 instead of 07:10.”
5. Skip a day, pause for holidays, or change the time from the app. Family can follow the trip live.

**Driver workflow**
1. A driver with their own car, or a Hop partner car, signs up and is verified.
2. They accept recurring commute routes that fit their area and hours.
3. They get a daily schedule, navigation, and weekly payouts with predictable income.

**Options to explore**
- **Shared commute:** neighbours going the same way share one driver and split the cost, like a private danfo for an estate.
- **Mixed commute:** the driver takes you to the BRT terminal or train station when that beats driving all the way.
- **Company plans:** employers pay for their staff’s commute.

**Safety**
- Verified drivers.
- Trip codes at pickup.
- Live trip sharing.
- An SOS button.
- Ratings after every week.

---

## 5. Roadmap

### Phase 1: hackathon demo (now)
- [x] Trip planner with real road routes, ranked options and reasons
- [x] Hop’s own map, light and dark, with lines, stations, landmarks and traffic
- [x] Live map with a traffic time slider and main corridors
- [x] Rent browsing, car pages, fuel estimate, car with driver
- [x] One account for everyone, plus a staff view
- [ ] Live trip with rerouting and “Simulate a jam”
- [ ] Best time to leave
- [ ] Booking flow with Dojah test mode and a simulated payment
- [ ] Deploy to Vercel and record the 3-minute demo video

### Phase 2: real data
- [ ] Google Routes API for live road traffic, with Hop’s own map style
- [ ] Commuter reports: jams, floods, missing buses, closures
- [ ] Saved places, saved routes and alerts before you leave
- [ ] A data partnership with LAMATA for BRT and rail schedules
- [ ] Real accounts with phone number sign-in

### Phase 3: money and trust
- [ ] Paystack payments, deposits and refunds
- [ ] Listing a car, the owner dashboard and payouts
- [ ] Pickup and return photo logs, and the dispute process
- [ ] Staff dashboard

### Phase 4: new products
- [ ] **Hop Daily:** recurring commute drivers (section 4)
- [ ] Shared commutes and company commute plans
- [ ] Splitting the cost of a rental or ride with friends
- [ ] Cowry card balance and top-up
- [ ] Pidgin, Yoruba, Igbo and Hausa
- [ ] Mobile apps for iOS and Android, with offline routes for low signal

---

## 6. Open questions
- **Pricing for Hop Daily:** a weekly subscription, per trip with a discount, or both?
- **Drivers for Hop Daily:** existing ride-hail drivers, partner fleets, or people who list their car with themselves as driver?
- **Revenue:** commission on rentals and Hop Daily, a convenience fee on bookings, and B2B commute plans.
- **Rentals:** minimum age and years of driving for self-drive.
