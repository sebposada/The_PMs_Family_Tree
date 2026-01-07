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

## JSON Import
- [x] Create import script to load user's updated JSON data
- [x] Clear existing placeholder data
- [x] Import real people data from JSON (91 people)
- [x] Import partnerships data from JSON (33 partnerships)
- [x] Verify data imported correctly (91 people showing in directory)

## Primary Photo Feature
- [x] Add "Set Primary Photo" button to People Management edit form
- [x] Show available photos where the person is tagged
- [x] Allow selecting a photo to set as primary profile photo
- [x] Update person's primaryMediaId when photo is selected
- [x] Display current primary photo in the edit form
- [x] Add media.getByPerson tRPC procedure
- [x] Fix storage import path in upload.ts
- [x] Test primary photo selection workflow (3 tests passing)

## Primary Photo Display Bug
- [x] Update getAllPeople query to join with media table and include primary photo URL
- [x] Update getPersonById query to include primary photo URL
- [x] Update searchPeople query to include primary photo URL
- [x] Fix Directory page to display primary photo instead of placeholder
- [x] Fix PersonDetail page to display primary photo in infobox
- [ ] Fix Tree page to display primary photos (when tree is implemented)
- [x] Test that primary photos display correctly after selection (40 tests passing)

## Interactive Family Tree Visualization
- [x] Create tree layout algorithm that builds hierarchical structure from partnerships
- [x] Model partnerships as union nodes (Partner1 → Union ← Partner2, Union → Children)
- [x] Build custom PersonNode component with photo, name, and birth-death years
- [x] Build custom UnionNode component for partnership connections
- [x] Implement React Flow tree with top-to-bottom orientation
- [x] Add zoom and pan controls
- [x] Add minimap for navigation
- [x] Implement search box with highlight and auto-zoom to person
- [x] Make person nodes clickable to navigate to detail pages
- [x] Test tree with 91 people and 33 partnerships (44 tests passing, tree data validated)
- [x] Optimize performance for large tree rendering (using Dagre layout)

## Family Tree Improvements
- [x] Import user's additional partnerships from file (25 partnerships added)
- [x] Total partnerships now: 58 (33 original + 25 new)
- [x] Verify tree layout shows proper generational structure
- [x] Test tree rendering with updated partnerships (44 tests passing)

## Partnership Children (Parent-Child Relationships)
- [x] Query existing partnership children records
- [x] Identify missing parent-child relationships
- [x] Create partnership children records for all families (63 relationships)
- [x] Add partnership children for people born in 1800s (earliest generation) - 14 relationships
- [x] Total partnership children now: 82 records (5 original + 77 new)
- [x] Verify tree shows proper generational hierarchy with children under parents
- [x] All 44 tests passing with data integrity validated

## Tree Layout Fix (Generation-Based Hierarchy)
- [x] Implement generation-based hierarchical layout algorithm
- [x] Calculate generation levels from parent-child relationships
- [x] Remove Dagre and implement custom layout with manual positioning
- [x] Test tree displays with clear generational rows
- [x] Clean up test data from database
- [x] Tree now displays 59 real family members in generational hierarchy

## Bug Fix: Duplicate React Key Error
- [x] Investigate admin page for duplicate person-91 key
- [x] Fix duplicate key issue in admin component (added deduplication to PeopleManagement, PartnershipsManagement, MediaManagement)
- [x] Test admin page to verify error is resolved (all tabs tested, no console errors, 44 tests passing)

## Family Tree Rebuild (Using @alexbrand09/famtreejs Library)
- [x] Install @alexbrand09/famtreejs library
- [x] Transform our data model to match library's format (people + partnerships)
- [x] Create custom PersonCard component matching our design
- [x] Replace Tree.tsx implementation with FamilyTree component
- [x] Configure orientation, spacing, and styling
- [x] Test with real family data - tree now displays with proper hierarchical structure
- [x] Remove old treeLayout.ts, PersonNode.tsx, UnionNode.tsx files

## Bug Fix: Family Tree Not Rendering + Missing Navbar
- [x] Investigate browser console errors for tree rendering failure (React 19 compatibility issue with famtreejs)
- [x] Fix tree rendering issues (switched to ReactFlow, fixed useNodesState initialization)
- [x] Restore navigation bar to tree page
- [x] Test tree page - tree now renders with 37 people and 30 edges

## Bug Fix: Infinite Loop in Tree Page
- [x] Remove problematic useEffect that causes infinite re-renders
- [x] Fix nodes/edges state initialization with ref-based change detection
- [x] Test tree page - infinite loop error resolved, tree renders correctly
