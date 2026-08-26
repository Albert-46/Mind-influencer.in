if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

document.addEventListener('DOMContentLoaded', () => {
    // Mobile Navigation Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileNav = document.querySelector('.mobile-nav');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    const navbar = document.getElementById('navbar');
    
    if (mobileMenuBtn && mobileNav) {
        const toggleMenu = (forceClose = false) => {
            const isOpen = forceClose ? false : !mobileNav.classList.contains('active');
            if (isOpen) {
                mobileNav.classList.add('active');
                mobileMenuBtn.setAttribute('aria-expanded', 'true');
                mobileMenuBtn.setAttribute('aria-label', 'Close navigation menu');
                document.body.style.overflow = 'hidden'; // Lock scroll
                // Move focus to first nav link
                if (mobileNavLinks.length > 0) {
                    mobileNavLinks[0].focus();
                }
            } else {
                mobileNav.classList.remove('active');
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
                mobileMenuBtn.setAttribute('aria-label', 'Open navigation menu');
                document.body.style.overflow = ''; // Restore scroll
                mobileMenuBtn.focus(); // Restore focus to button
            }
        };

        mobileMenuBtn.addEventListener('click', () => toggleMenu());

        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => toggleMenu(true));
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileNav.classList.contains('active')) {
                toggleMenu(true);
            }
        });
    }

    // Navbar Scroll Effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });


    // Smooth Scrolling & Focus Management
    const actionBtns = document.querySelectorAll('a[href^="#"], button[data-focus], #btn-first-reviewer');
    const courseSelect = document.getElementById('course-select');
    
    actionBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const href = btn.getAttribute('href');
            if (!href && !btn.id) return;
            
            // Special handling for the "Be Our First Reviewer" button
            if (btn.id === 'btn-first-reviewer') {
                e.preventDefault();
                const reviewForm = document.getElementById('review-submission-area');
                if (reviewForm) {
                    // scrollIntoView with block:'start' respects the CSS scroll-margin-top
                    // set on #review-submission-area, keeping the form clear of the fixed header.
                    reviewForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    // Focus the first meaningful field after the scroll animation completes.
                    const nameInput = document.getElementById('review-name');
                    if (nameInput) setTimeout(() => nameInput.focus(), 600);
                }
                return;
            }

            if (href && href.startsWith('#')) {
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    
                    // Pre-fill course if applicable
                    const courseName = btn.getAttribute('data-course');
                    if (courseSelect && courseName) {
                        courseSelect.value = courseName;
                    }
                    
                    target.scrollIntoView({ behavior: 'smooth' });
                    
                    // Focus management
                    const focusTargetId = btn.getAttribute('data-focus');
                    if (focusTargetId) {
                        const focusTarget = document.getElementById(focusTargetId);
                        if (focusTarget) {
                            setTimeout(() => focusTarget.focus(), 500); // Wait for scroll
                        }
                    }
                }
            }
        });
    });

    // ── Policy Modal Logic ────────────────────────────────────────────────────
    const policyModal = document.getElementById('policy-modal');
    const policyBtns = document.querySelectorAll('.policy-link-btn');
    const closeBtns = document.querySelectorAll('[data-close-modal]');
    const modalTitle = document.getElementById('policy-modal-title');
    const modalBody = document.getElementById('policy-modal-body');

    const policies = {
        'privacy': {
            title: 'Privacy Policy',
            content: '<p>Mind Influencer | MIAFL is committed to protecting your privacy. We collect minimal personal information (such as your name, email, and phone number) solely for the purpose of communicating with you regarding your course enquiries and language training.</p><p>We do not share, sell, or distribute your personal data to third parties without your explicit consent, except as required by law. Your data is stored securely and used only for internal educational and administrative purposes.</p>'
        },
        'terms': {
            title: 'Terms & Conditions',
            content: '<p>By enrolling in courses at Mind Influencer | MIAFL, you agree to abide by our code of conduct. Students are expected to attend classes regularly, complete assignments, and engage respectfully with instructors and peers.</p><p>All study materials provided remain the intellectual property of Mind Influencer | MIAFL and may not be distributed or reproduced without permission.</p>'
        },
        'refund': {
            title: 'Refund / Cancellation Policy',
            content: '<p>We offer a free demo class to ensure you are satisfied with our teaching methodology before enrolling. Once a student has officially enrolled and fees have been paid, refunds are generally not provided.</p><p>In exceptional circumstances (such as medical emergencies), refund or class rescheduling requests will be evaluated on a case-by-case basis by the administration.</p>'
        }
    };

    function openModal(policyKey) {
        if (!policyModal || !policies[policyKey]) return;
        modalTitle.textContent = policies[policyKey].title;
        modalBody.innerHTML = policies[policyKey].content;
        policyModal.setAttribute('aria-hidden', 'false');
        
        // Trap focus or at least set focus to modal close button
        const closeBtn = policyModal.querySelector('.modal-close');
        if (closeBtn) closeBtn.focus();
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        if (!policyModal) return;
        policyModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    policyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const policyKey = btn.getAttribute('data-policy');
            openModal(policyKey);
        });
    });

    closeBtns.forEach(btn => {
        btn.addEventListener('click', closeModal);
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && policyModal && policyModal.getAttribute('aria-hidden') === 'false') {
            closeModal();
        }
    });

    // ── Enquiry Form — Formspree Submission ──────────────────────────────────
    const form       = document.getElementById('enquiry-form');
    const submitBtn  = document.getElementById('submit-btn');
    const btnText    = submitBtn?.querySelector('.btn-text');
    const btnSpinner = submitBtn?.querySelector('.btn-spinner');
    const formAlert  = document.getElementById('form-alert');

    function showAlert(type, html) {
        if (!formAlert) return;
        formAlert.innerHTML = html;
        formAlert.className = 'form-alert ' + type;
        formAlert.style.display = 'block';
        formAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function markInvalid(field) {
        field.classList.add('error');
        const heal = () => field.classList.remove('error');
        field.addEventListener('input',  heal, { once: true });
        field.addEventListener('change', heal, { once: true });
    }

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            formAlert.style.display = 'none';
            formAlert.className = 'form-alert';

            const nameField   = document.getElementById('name');
            const emailField  = document.getElementById('email');
            const phoneField  = document.getElementById('phone');
            const courseField = document.getElementById('course-select');

            let isValid = true;
            const requiredFields = [nameField, emailField, phoneField, courseField];

            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    markInvalid(field);
                    isValid = false;
                } else {
                    field.classList.remove('error');
                }
            });

            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailField.value.trim() && !emailPattern.test(emailField.value.trim())) {
                markInvalid(emailField);
                isValid = false;
            }

            if (!isValid) {
                showAlert('error', '<svg class="fas fa-exclamation-circle" aria-hidden="true" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M256 512a256 256 0 1 1 0-512 256 256 0 1 1 0 512zm0-192a32 32 0 1 0 0 64 32 32 0 1 0 0-64zm0-192c-18.2 0-32.7 15.5-31.4 33.7l7.4 104c.9 12.6 11.4 22.3 23.9 22.3 12.6 0 23-9.7 23.9-22.3l7.4-104c1.3-18.2-13.1-33.7-31.4-33.7z"/></svg> Please fill in all required fields correctly.');
                return;
            }

            submitBtn.disabled   = true;
            btnText.style.display    = 'none';
            btnSpinner.style.display = 'inline-flex';
            showAlert('pending', '<svg class="fas fa-circle-notch fa-spin" aria-hidden="true" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M222.7 32.1c5 16.9-4.6 34.8-21.5 39.8-79.3 23.6-137.1 97.1-137.1 184.1 0 106 86 192 192 192s192-86 192-192c0-86.9-57.8-160.4-137.1-184.1-16.9-5-26.6-22.9-21.5-39.8s22.9-26.6 39.8-21.5C434.9 42.1 512 140 512 256 512 397.4 397.4 512 256 512S0 397.4 0 256c0-116 77.1-213.9 182.9-245.4 16.9-5 34.8 4.6 39.8 21.5z"/></svg> Submitting your enquiry...');

            try {
                const response = await fetch(form.action, {
                    method:  'POST',
                    headers: { 'Accept': 'application/json' },
                    body:    new FormData(form),
                });

                if (response.ok) {
                    showAlert('success', '<svg class="fas fa-check-circle" aria-hidden="true" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M256 512a256 256 0 1 1 0-512 256 256 0 1 1 0 512zM374 145.7c-10.7-7.8-25.7-5.4-33.5 5.3L221.1 315.2 169 263.1c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l72 72c5 5 11.8 7.5 18.8 7s13.4-4.1 17.5-9.8L379.3 179.2c7.8-10.7 5.4-25.7-5.3-33.5z"/></svg> Thank you! Your enquiry has been received. We\'ll be in touch with you soon.');
                    if (window.logFirebaseEvent) {
                        window.logFirebaseEvent('contact_form_submit', { course: courseField ? courseField.value : undefined });
                    }
                    form.reset();
                } else {
                    const data = await response.json().catch(() => ({}));
                    const msg  = (data.errors && data.errors.map(err => err.message).join(', ')) || 'Something went wrong. Please try again or contact us directly.';
                    showAlert('error', '<svg class="fas fa-times-circle" aria-hidden="true" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M256 512a256 256 0 1 0 0-512 256 256 0 1 0 0 512zM167 167c9.4-9.4 24.6-9.4 33.9 0l55 55 55-55c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-55 55 55 55c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-55-55-55 55c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l55-55-55-55c-9.4-9.4-9.4-24.6 0-33.9z"/></svg> ' + msg);
                }
            } catch (networkError) {
                showAlert('error', '<svg class="fas fa-wifi" aria-hidden="true" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill="currentColor" d="M288 96c-90.9 0-173.2 36-233.7 94.6-12.7 12.3-33 12-45.2-.7s-12-33 .7-45.2C81.7 74.9 179.9 32 288 32S494.3 74.9 566.3 144.7c12.7 12.3 13 32.6 .7 45.2s-32.6 13-45.2 .7C461.2 132 378.9 96 288 96zM240 432a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zM168 326.2c-11.7 13.3-31.9 14.5-45.2 2.8s-14.5-31.9-2.8-45.2C161 237.4 221.1 208 288 208s127 29.4 168 75.8c11.7 13.3 10.4 33.5-2.8 45.2s-33.5 10.4-45.2-2.8C378.6 292.9 335.8 272 288 272s-90.6 20.9-120 54.2z"/></svg> Unable to send your enquiry. Please check your connection and try again, or reach us directly at <a href="mailto:info@mindinfluencer.in">info@mindinfluencer.in</a>.');
            } finally {
                submitBtn.disabled       = false;
                btnText.style.display    = 'inline-block';
                btnSpinner.style.display = 'none';
            }
        });
    }

    // ── Student Reviews ──────────────────────────────────────────────────────
    // Point to wherever the FastAPI backend is running.
    // Local dev: http://127.0.0.1:8000  |  Production: https://api.mindinfluencer.in (example)
    const BACKEND_URL = "http://127.0.0.1:8000";

    function escapeHTML(str) {
        const el = document.createElement("div");
        el.appendChild(document.createTextNode(str || ""));
        return el.innerHTML;
    }

    function starsHTML(rating) {
        let html = `<span aria-label="${rating} out of 5 stars">`;
        for (let i = 1; i <= 5; i++) {
            html += i <= rating
                ? `<svg class="fas fa-star" aria-hidden="true" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill="currentColor" d="M309.5-18.9c-4.1-8-12.4-13.1-21.4-13.1s-17.3 5.1-21.4 13.1L193.1 125.3 33.2 150.7c-8.9 1.4-16.3 7.7-19.1 16.3s-.5 18 5.8 24.4l114.4 114.5-25.2 159.9c-1.4 8.9 2.3 17.9 9.6 23.2s16.9 6.1 25 2L288.1 417.6 432.4 491c8 4.1 17.7 3.3 25-2s11-14.2 9.6-23.2L441.7 305.9 556.1 191.4c6.4-6.4 8.6-15.8 5.8-24.4s-10.1-14.9-19.1-16.3L383 125.3 309.5-18.9z"/></svg>`
                : `<svg class="far fa-star" aria-hidden="true" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill="currentColor" d="M288.1-32c9 0 17.3 5.1 21.4 13.1L383 125.3 542.9 150.7c8.9 1.4 16.3 7.7 19.1 16.3s.5 18-5.8 24.4L441.7 305.9 467 465.8c1.4 8.9-2.3 17.9-9.6 23.2s-17 6.1-25 2L288.1 417.6 143.8 491c-8 4.1-17.7 3.3-25-2s-11-14.2-9.6-23.2L134.4 305.9 20 191.4c-6.4-6.4-8.6-15.8-5.8-24.4s10.1-14.9 19.1-16.3l159.9-25.4 73.6-144.2c4.1-8 12.4-13.1 21.4-13.1zm0 76.8L230.3 158c-3.5 6.8-10 11.6-17.6 12.8l-125.5 20 89.8 89.9c5.4 5.4 7.9 13.1 6.7 20.7l-19.8 125.5 113.3-57.6c6.8-3.5 14.9-3.5 21.8 0l113.3 57.6-19.8-125.5c-1.2-7.6 1.3-15.3 6.7-20.7l89.8-89.9-125.5-20c-7.6-1.2-14.1-6-17.6-12.8L288.1 44.8z"/></svg>`;
        }
        return html + "</span>";
    }

    function formatDate(iso) {
        try {
            return new Date(iso).toLocaleDateString("en-IN", {
                year: "numeric", month: "short", day: "numeric",
            });
        } catch { return ""; }
    }

    async function loadReviews() {
        const container = document.getElementById("reviews-container");
        const emptyState = document.getElementById("reviews-empty-state");
        if (!container || !emptyState) return;

        // Display empty launch state if no backend configured
        if (!BACKEND_URL) {
            emptyState.style.display = "block";
            container.classList.add("sr-only");
            return;
        }

        try {
            const res = await fetch(`${BACKEND_URL}/api/reviews`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const data = await res.json();
            const reviews = Array.isArray(data) ? data : (data.reviews || []);

            // If 0 approved reviews, show empty launch state
            if (!reviews || reviews.length === 0) {
                emptyState.style.display = "block";
                container.classList.add("sr-only");
                return;
            }

            // At least 1 approved review exists: hide empty state, show grid
            emptyState.style.display = "none";
            container.classList.remove("sr-only");
            
            // If 3 or more, we could theoretically change a CTA to "Share Your Experience"
            // For now, render the cards.
            container.innerHTML = reviews.map((r) => `
                <article class="review-card" aria-label="Review by ${escapeHTML(r.student_name)}">
                    <div class="review-header">
                        <div>
                            <h4 class="reviewer-name">${escapeHTML(r.student_name)}</h4>
                            <span class="reviewer-course">
                                ${escapeHTML(r.course)}
                                ${r.verified_outcome ? ` — <strong>${escapeHTML(r.verified_outcome)}</strong>` : ""}
                            </span>
                        </div>
                        <div class="review-rating">${starsHTML(r.rating)}</div>
                    </div>
                    ${r.title ? `<h5 class="review-title">${escapeHTML(r.title)}</h5>` : ""}
                    <p class="review-body">"${escapeHTML(r.body)}"</p>
                    <time class="review-date" datetime="${r.created_at}">${formatDate(r.created_at)}</time>
                </article>
            `).join("");

        } catch (err) {
            console.error("Failed to load reviews:", err);
            emptyState.style.display = "block";
            container.classList.add("sr-only");
        }
    }

    function initReviewForm() {
        const form      = document.getElementById("student-review-form");
        const alert     = document.getElementById("review-form-alert");
        const submitBtn = document.getElementById("review-submit-btn");
        if (!form) return;

        function showReviewAlert(type, html) {
            if (!alert) return;
            alert.innerHTML = html;
            alert.className = `form-alert ${type}`;
            alert.style.display = "block";
        }

        function setReviewLoading(isLoading) {
            if (!submitBtn) return;
            submitBtn.disabled = isLoading;
            const txt = submitBtn.querySelector(".btn-text");
            const spn = submitBtn.querySelector(".btn-spinner");
            if (txt) txt.style.display = isLoading ? "none" : "inline-block";
            if (spn) spn.style.display = isLoading ? "inline-flex" : "none";
        }

        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            // Guard: only block submission if no backend URL is configured at all.
            // An empty approved-review list is NOT a reason to disable submission.
            if (!BACKEND_URL) {
                showReviewAlert("error", '<svg class="fas fa-info-circle" aria-hidden="true" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M256 512a256 256 0 1 0 0-512 256 256 0 1 0 0 512zM224 160a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm-8 64l48 0c13.3 0 24 10.7 24 24l0 88 8 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-80 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l24 0 0-64-24 0c-13.3 0-24-10.7-24-24s10.7-24 24-24z"/></svg> Review submission is not yet configured. Please check back soon.');
                return;
            }

            if (alert) alert.style.display = "none";

            const fd = new FormData(form);
            const payload = {
                student_name: (fd.get("student_name") || "").trim(),
                course:       (fd.get("course")       || "").trim(),
                rating:       parseInt(fd.get("rating") || "0", 10),
                title:        (fd.get("title")         || "").trim() || null,
                body:         (fd.get("body")          || "").trim(),
            };

            if (!payload.student_name) return showReviewAlert("error", 'Please enter your name.');
            if (!payload.course) return showReviewAlert("error", 'Please select a course.');
            if (!payload.rating || payload.rating < 1 || payload.rating > 5) return showReviewAlert("error", 'Please select a star rating (1-5).');
            if (!payload.body || payload.body.length < 10) return showReviewAlert("error", 'Your review must be at least 10 characters.');

            setReviewLoading(true);
            showReviewAlert("pending", 'Submitting your review...');

            try {
                const res = await fetch(`${BACKEND_URL}/api/reviews`, {
                    method:  "POST",
                    headers: { "Content-Type": "application/json" },
                    body:    JSON.stringify(payload),
                });

                const data = await res.json().catch(() => ({}));

                if (res.ok || res.status === 201) {
                    showReviewAlert("success", data.message || "Thank you for sharing your experience. Your review has been submitted and will appear once approved.");
                    form.reset();
                    const counter = document.getElementById("body-char-counter");
                    if (counter) counter.textContent = "0 / 2000";
                } else {
                    const msg = (typeof data.error === "string") ? data.error : "Something went wrong. Please check your input and try again.";
                    showReviewAlert("error", escapeHTML(msg));
                }
            } catch (networkErr) {
                showReviewAlert("error", 'Network error. Please try again.');
            } finally {
                setReviewLoading(false);
            }
        });
    }

    const bodyTextarea = document.getElementById('review-body');
    const charCounter  = document.getElementById('body-char-counter');
    const MAX_BODY     = 2000;
    if (bodyTextarea && charCounter) {
        bodyTextarea.addEventListener('input', () => {
            const len = bodyTextarea.value.length;
            charCounter.textContent = `${len} / ${MAX_BODY}`;
            charCounter.classList.toggle('near-limit', len >= MAX_BODY * 0.85 && len < MAX_BODY);
            charCounter.classList.toggle('at-limit',   len >= MAX_BODY);
        });
    }

    // Init
    loadReviews();
    initReviewForm();
});
