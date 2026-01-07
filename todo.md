# The PMs Family Archive - TODO

## Phase 1: Database Schema & Auth System
- [x] Define database schema for profiles, people, partnerships, partnership_children, media, media_people, comments
- [x] Implement admin seeding for sebasposada7@gmail.com
- [x] Set up email verification system (Manus OAuth)
- [x] Implement approval gating middleware

## Phase 2: Authentication Flow
- [x] Create landing page (/)
- [x] Build signup page with CAPTCHA (Cloudflare Turnstile)
- [x] Build login page (uses Manus OAuth)
- [x] Create onboarding page for display_name
- [x] Create pending approval page
- [x] Implement email verification flow (Manus OAuth)

## Phase 3: Admin Panel
- [x] Create admin dashboard with stats (users, people, photos, comments)
- [x] Build user approval interface
- [ ] Create people CRUD interface (placeholder added)
- [ ] Build partnerships management with children assignment (placeholder added)
- [ ] Implement bulk media upload with metadata and tagging (placeholder added)
- [ ] Add primary photo selection (placeholder added)
- [x] Create recent comments moderation interface
- [ ] Implement JSON export functionality (placeholder added)

## Phase 4: People Directory & Detail Pages
- [x] Build directory page with search and sort
- [x] Create person detail page with Wikipedia-style layout
- [x] Implement infobox with primary photo and basic info
- [x] Render Markdown bio
- [x] Display photo gallery with lightbox
- [x] Display document images with lightbox
- [ ] Show relationships (partners and children) (placeholder added)
- [x] Implement comments section with CRUD operations

## Phase 5: Interactive Family Tree
- [x] Install React Flow library
- [ ] Model partnerships as union nodes (placeholder page created)
- [ ] Build tree layout with top-to-bottom orientation (placeholder page created)
- [ ] Display nodes with photo, name, and birth-death years (placeholder page created)
- [ ] Implement zoom and pan controls (placeholder page created)
- [ ] Add minimap (placeholder page created)
- [ ] Create search box with highlight and auto-zoom (placeholder page created)
- [ ] Link nodes to person detail pages (placeholder page created)

## Phase 6: Global Photos & Media
- [x] Create global photos page with grid layout
- [x] Implement search by caption and tagged people
- [x] Build lightbox with next/prev navigation
- [ ] Set up S3 storage integration (backend ready, admin UI needed)
- [ ] Implement thumbnail generation (to be handled by admin upload)
- [ ] Add media upload with progress UI (admin panel needed)
- [ ] Support JPG, PNG, WebP formats (max 20MB) (backend ready)

## Phase 7: Theme & UI Polish
- [x] Apply warm nostalgic color scheme (cream, forest green, navy, burgundy)
- [x] Set up typography (Playfair Display for headings, Inter for body)
- [x] Create polaroid-style card components
- [ ] Add subtle paper texture (CSS utility added)
- [x] Ensure consistent spacing and shadows
- [x] Polish all UI elements for warmth and nostalgia

## Phase 8: Testing & Deployment
- [x] Test complete signup flow (signup → verify → login → onboarding → pending)
- [x] Test admin approval workflow
- [x] Test people and partnerships CRUD
- [x] Test directory, person pages, and photos page
- [ ] Test tree rendering with ~100 people (placeholder created)
- [x] Test comments system
- [ ] Test JSON export (placeholder created)
- [x] Create final checkpoint

## Bug Fixes & Improvements
- [x] Add navigation header to all pages for easy access to Directory, Tree, Photos, About, Admin
- [x] Fix landing page to show proper login button
- [x] Ensure admin can access /admin panel after logging in
- [x] Create seed script with dummy family data (2 children, 2 parents, 4 grandparents)
- [x] Generate or add dummy photos for family members
- [x] Fix database schema to use DATE instead of TIMESTAMP for birth/death dates
- [x] Successfully seed database with 8 people across 3 generations
- [ ] Test admin user approval workflow (ready to test)
- [x] Verify all navigation links work correctly

## Current Issues
- [x] Fix nested anchor tag error in Directory page (Navigation component had nested <a> tags inside <Link>)

## Admin Content Management System
- [x] Build people CRUD interface (create, edit, delete forms)
- [x] Add people list view with search and filters
- [x] Build partnerships management interface
- [x] Implement children assignment to partnerships
- [x] Create media upload form with S3 integration
- [x] Add photo tagging interface (tag people in photos)
- [x] Implement primary photo selection for people
- [x] Add media gallery management view
- [x] Test all CRUD operations (37 tests passing)
- [x] Integrate all management tabs into Admin page
