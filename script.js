document.addEventListener('DOMContentLoaded', () => {
    // Mobile Navigation Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileNav = document.querySelector('.mobile-nav');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    const navbar = document.getElementById('navbar');
    
    if (mobileMenuBtn && mobileNav) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileNav.classList.toggle('active');
            const openIcon = mobileMenuBtn.querySelector('.menu-open-icon');
            const closeIcon = mobileMenuBtn.querySelector('.menu-close-icon');
            if (mobileNav.classList.contains('active')) {
                openIcon.style.display = 'none';
                closeIcon.style.display = 'inline-block';
            } else {
                openIcon.style.display = 'inline-block';
                closeIcon.style.display = 'none';
            }
        });

        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileNav.classList.remove('active');
                const openIcon = mobileMenuBtn.querySelector('.menu-open-icon');
                const closeIcon = mobileMenuBtn.querySelector('.menu-close-icon');
                if (openIcon && closeIcon) {
                    openIcon.style.display = 'inline-block';
                    closeIcon.style.display = 'none';
                }
            });
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

    // Course Selection from Cards
    const courseBtns = document.querySelectorAll('.course-btn');
    const courseSelect = document.getElementById('course-select');
    
    courseBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const courseName = btn.getAttribute('data-course');
            
            if (courseSelect && courseName) {
                courseSelect.value = courseName;
            }
            
            // Smooth scroll to form
            const contactSection = document.getElementById('contact');
            if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // ── Enquiry Form — Formspree Submission ──────────────────────────────────
    const form       = document.getElementById('enquiry-form');
    const submitBtn  = document.getElementById('submit-btn');
    const btnText    = submitBtn?.querySelector('.btn-text');
    const btnSpinner = submitBtn?.querySelector('.btn-spinner');
    const formAlert  = document.getElementById('form-alert');

    /** Show a status message in the alert area */
    function showAlert(type, html) {
        formAlert.innerHTML = html;
        formAlert.className = 'form-alert ' + type;
        formAlert.style.display = 'block';
        // Scroll the alert into view so mobile users see it
        formAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    /** Mark a field as invalid and attach a one-time self-healing listener */
    function markInvalid(field) {
        field.classList.add('error');
        const heal = () => field.classList.remove('error');
        field.addEventListener('input',  heal, { once: true });
        field.addEventListener('change', heal, { once: true });
    }

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // ── Reset previous alert ──────────────────────────────────────────
            formAlert.style.display = 'none';
            formAlert.className = 'form-alert';

            // ── Field references ──────────────────────────────────────────────
            const nameField   = document.getElementById('name');
            const emailField  = document.getElementById('email');
            const phoneField  = document.getElementById('phone');
            const courseField = document.getElementById('course-select');

            // ── Client-side validation ────────────────────────────────────────
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

            // Email format check
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailField.value.trim() && !emailPattern.test(emailField.value.trim())) {
                markInvalid(emailField);
                isValid = false;
            }

            if (!isValid) {
                showAlert('error', '<svg class="fas fa-exclamation-circle" aria-hidden="true" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Free 7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) Copyright 2026 Fonticons, Inc. --><path fill="currentColor" d="M256 512a256 256 0 1 1 0-512 256 256 0 1 1 0 512zm0-192a32 32 0 1 0 0 64 32 32 0 1 0 0-64zm0-192c-18.2 0-32.7 15.5-31.4 33.7l7.4 104c.9 12.6 11.4 22.3 23.9 22.3 12.6 0 23-9.7 23.9-22.3l7.4-104c1.3-18.2-13.1-33.7-31.4-33.7z"/></svg> Please fill in all required fields correctly.');
                return;
            }

            // ── Submitting state ──────────────────────────────────────────────
            submitBtn.disabled   = true;
            btnText.style.display    = 'none';
            btnSpinner.style.display = 'inline-flex';
            showAlert('pending', '<svg class="fas fa-circle-notch fa-spin" aria-hidden="true" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Free 7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) Copyright 2026 Fonticons, Inc. --><path fill="currentColor" d="M222.7 32.1c5 16.9-4.6 34.8-21.5 39.8-79.3 23.6-137.1 97.1-137.1 184.1 0 106 86 192 192 192s192-86 192-192c0-86.9-57.8-160.4-137.1-184.1-16.9-5-26.6-22.9-21.5-39.8s22.9-26.6 39.8-21.5C434.9 42.1 512 140 512 256 512 397.4 397.4 512 256 512S0 397.4 0 256c0-116 77.1-213.9 182.9-245.4 16.9-5 34.8 4.6 39.8 21.5z"/></svg> Submitting your enquiry\u2026');

            // ── Send to Formspree ─────────────────────────────────────────────
            try {
                const response = await fetch(form.action, {
                    method:  'POST',
                    headers: { 'Accept': 'application/json' },
                    body:    new FormData(form),
                });

                if (response.ok) {
                    // ── Success ───────────────────────────────────────────────
                    showAlert('success',
                        '<svg class="fas fa-check-circle" aria-hidden="true" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Free 7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) Copyright 2026 Fonticons, Inc. --><path fill="currentColor" d="M256 512a256 256 0 1 1 0-512 256 256 0 1 1 0 512zM374 145.7c-10.7-7.8-25.7-5.4-33.5 5.3L221.1 315.2 169 263.1c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l72 72c5 5 11.8 7.5 18.8 7s13.4-4.1 17.5-9.8L379.3 179.2c7.8-10.7 5.4-25.7-5.3-33.5z"/></svg> ' +
                        'Thank you! Your enquiry has been received. We\u2019ll be in touch with you soon.'
                    );

                    // ── Firebase Analytics: track successful enquiry submission ──
                    // Only fires on a confirmed HTTP 2xx response from Formspree.
                    // Failed submissions (validation errors, network issues) are NOT tracked.
                    if (window.logFirebaseEvent) {
                        window.logFirebaseEvent('contact_form_submit', {
                            course: courseField ? courseField.value : undefined
                        });
                    }

                    form.reset();
                } else {
                    // ── Server-side error (4xx / 5xx) ─────────────────────────
                    const data = await response.json().catch(() => ({}));
                    const msg  = (data.errors && data.errors.map(err => err.message).join(', '))
                                 || 'Something went wrong. Please try again or contact us directly.';
                    showAlert('error', '<svg class="fas fa-times-circle" aria-hidden="true" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Free 7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) Copyright 2026 Fonticons, Inc. --><path fill="currentColor" d="M256 512a256 256 0 1 0 0-512 256 256 0 1 0 0 512zM167 167c9.4-9.4 24.6-9.4 33.9 0l55 55 55-55c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-55 55 55 55c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-55-55-55 55c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l55-55-55-55c-9.4-9.4-9.4-24.6 0-33.9z"/></svg> ' + msg);
                }
            } catch (networkError) {
                // ── Network / connectivity error ──────────────────────────────
                showAlert('error',
                    '<svg class="fas fa-wifi" aria-hidden="true" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><!--! Font Awesome Free 7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) Copyright 2026 Fonticons, Inc. --><path fill="currentColor" d="M288 96c-90.9 0-173.2 36-233.7 94.6-12.7 12.3-33 12-45.2-.7s-12-33 .7-45.2C81.7 74.9 179.9 32 288 32S494.3 74.9 566.3 144.7c12.7 12.3 13 32.6 .7 45.2s-32.6 13-45.2 .7C461.2 132 378.9 96 288 96zM240 432a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zM168 326.2c-11.7 13.3-31.9 14.5-45.2 2.8s-14.5-31.9-2.8-45.2C161 237.4 221.1 208 288 208s127 29.4 168 75.8c11.7 13.3 10.4 33.5-2.8 45.2s-33.5 10.4-45.2-2.8C378.6 292.9 335.8 272 288 272s-90.6 20.9-120 54.2z"/></svg> ' +
                    'Unable to send your enquiry. Please check your connection and try again, ' +
                    'or reach us directly at <a href="mailto:info@mindinfluencer.in">info@mindinfluencer.in</a>.'
                );
            } finally {
                // ── Restore button regardless of outcome ──────────────────────
                submitBtn.disabled       = false;
                btnText.style.display    = 'inline-block';
                btnSpinner.style.display = 'none';
            }
        });
    }

    // ── Student Reviews ──────────────────────────────────────────────────────

    // ── Backend configuration ─────────────────────────────────────────────────
    // Set this to your deployed FastAPI backend URL, e.g.:
    // const BACKEND_URL = "https://your-api.onrender.com";
    // Leave empty to hide the reviews section until a backend is deployed.
    const BACKEND_URL = "";

    // ── XSS-safe text renderer ────────────────────────────────────────────────────
    function escapeHTML(str) {
        const el = document.createElement("div");
        el.appendChild(document.createTextNode(str || ""));
        return el.innerHTML;
    }

    // ── Star HTML helper ──────────────────────────────────────────────────────────
    function starsHTML(rating) {
        let html = `<span aria-label="${rating} out of 5 stars">`;
        for (let i = 1; i <= 5; i++) {
            html += i <= rating
                ? `<svg class="fas fa-star" aria-hidden="true" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><!--! Font Awesome Free 7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) Copyright 2026 Fonticons, Inc. --><path fill="currentColor" d="M309.5-18.9c-4.1-8-12.4-13.1-21.4-13.1s-17.3 5.1-21.4 13.1L193.1 125.3 33.2 150.7c-8.9 1.4-16.3 7.7-19.1 16.3s-.5 18 5.8 24.4l114.4 114.5-25.2 159.9c-1.4 8.9 2.3 17.9 9.6 23.2s16.9 6.1 25 2L288.1 417.6 432.4 491c8 4.1 17.7 3.3 25-2s11-14.2 9.6-23.2L441.7 305.9 556.1 191.4c6.4-6.4 8.6-15.8 5.8-24.4s-10.1-14.9-19.1-16.3L383 125.3 309.5-18.9z"/></svg>`
                : `<svg class="far fa-star" aria-hidden="true" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><!--! Font Awesome Free 7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) Copyright 2026 Fonticons, Inc. --><path fill="currentColor" d="M288.1-32c9 0 17.3 5.1 21.4 13.1L383 125.3 542.9 150.7c8.9 1.4 16.3 7.7 19.1 16.3s.5 18-5.8 24.4L441.7 305.9 467 465.8c1.4 8.9-2.3 17.9-9.6 23.2s-17 6.1-25 2L288.1 417.6 143.8 491c-8 4.1-17.7 3.3-25-2s-11-14.2-9.6-23.2L134.4 305.9 20 191.4c-6.4-6.4-8.6-15.8-5.8-24.4s10.1-14.9 19.1-16.3l159.9-25.4 73.6-144.2c4.1-8 12.4-13.1 21.4-13.1zm0 76.8L230.3 158c-3.5 6.8-10 11.6-17.6 12.8l-125.5 20 89.8 89.9c5.4 5.4 7.9 13.1 6.7 20.7l-19.8 125.5 113.3-57.6c6.8-3.5 14.9-3.5 21.8 0l113.3 57.6-19.8-125.5c-1.2-7.6 1.3-15.3 6.7-20.7l89.8-89.9-125.5-20c-7.6-1.2-14.1-6-17.6-12.8L288.1 44.8z"/></svg>`;
        }
        return html + "</span>";
    }

    // ── Format ISO date for display ───────────────────────────────────────────────
    function formatDate(iso) {
        try {
            return new Date(iso).toLocaleDateString("en-IN", {
                year: "numeric", month: "short", day: "numeric",
            });
        } catch { return ""; }
    }

    // ════════════════════════════════════════════════════════════════════════════
    //  1. LOAD APPROVED REVIEWS
    // ════════════════════════════════════════════════════════════════════════════

    async function loadReviews(courseFilter = "") {
        const container = document.getElementById("reviews-container");
        if (!container) return;

        // If no backend is configured, show a friendly placeholder
        if (!BACKEND_URL) {
            container.innerHTML = `
                <p style="grid-column:1/-1; text-align:center; padding:3rem; color:var(--text);">
                    <svg class="far fa-comment-dots" aria-hidden="true" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Free 7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) Copyright 2026 Fonticons, Inc. --><path fill="currentColor" d="M0 240c0 54.4 19.3 104.6 51.9 144.9L3.1 474.3c-2 3.7-3.1 7.9-3.1 12.2 0 14.1 11.4 25.5 25.5 25.5 4 0 7.8-.6 11.5-2.1L153.4 460c31.4 12.9 66.1 20 102.6 20 141.4 0 256-107.5 256-240S397.4 0 256 0 0 107.5 0 240zM94 407.9c9.3-17.1 7.4-38.1-4.8-53.2-26.1-32.3-41.2-71.9-41.2-114.7 0-103.2 90.2-192 208-192s208 88.8 208 192-90.2 192-208 192c-30.2 0-58.7-5.9-84.3-16.4-11.9-4.9-25.3-4.8-37.1 .3L76 440.9 94 407.9zM144 272a32 32 0 1 0 0-64 32 32 0 1 0 0 64zm144-32a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm80 32a32 32 0 1 0 0-64 32 32 0 1 0 0 64z"/></svg>
                    Mind Influencer | MIAFL is welcoming its first learning community.<br>
                    <span style="font-size:0.9rem;">Launch-batch testimonials will be published after students begin their learning journey.</span>
                </p>`;
            return;
        }

        // Show loading skeletons while fetch is in progress
        container.innerHTML = `
            <div class="review-skeleton" aria-hidden="true"></div>
            <div class="review-skeleton" aria-hidden="true"></div>
            <div class="review-skeleton" aria-hidden="true"></div>`;

        try {
            const url = courseFilter
                ? `${BACKEND_URL}/api/reviews?course=${encodeURIComponent(courseFilter)}`
                : `${BACKEND_URL}/api/reviews`;

            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const data = await res.json();
            // Handle both plain array (FastAPI) and wrapped object (Flask) response structures
            const reviews = Array.isArray(data) ? data : (data.reviews || []);

            if (!reviews || reviews.length === 0) {
                container.innerHTML = `
                    <p style="grid-column:1/-1; text-align:center; padding:3rem; color:var(--text);">
                        <svg class="far fa-comment-dots" aria-hidden="true" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Free 7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) Copyright 2026 Fonticons, Inc. --><path fill="currentColor" d="M0 240c0 54.4 19.3 104.6 51.9 144.9L3.1 474.3c-2 3.7-3.1 7.9-3.1 12.2 0 14.1 11.4 25.5 25.5 25.5 4 0 7.8-.6 11.5-2.1L153.4 460c31.4 12.9 66.1 20 102.6 20 141.4 0 256-107.5 256-240S397.4 0 256 0 0 107.5 0 240zM94 407.9c9.3-17.1 7.4-38.1-4.8-53.2-26.1-32.3-41.2-71.9-41.2-114.7 0-103.2 90.2-192 208-192s208 88.8 208 192-90.2 192-208 192c-30.2 0-58.7-5.9-84.3-16.4-11.9-4.9-25.3-4.8-37.1 .3L76 440.9 94 407.9zM144 272a32 32 0 1 0 0-64 32 32 0 1 0 0 64zm144-32a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm80 32a32 32 0 1 0 0-64 32 32 0 1 0 0 64z"/></svg>
                        Mind Influencer | MIAFL is welcoming its first learning community.<br>
                        <span style="font-size:0.9rem;">Launch-batch testimonials will be published after students begin their learning journey.</span>
                    </p>`;
                return;
            }

            container.innerHTML = reviews.map((r) => `
                <article class="review-card" aria-label="Review by ${escapeHTML(r.student_name)}">
                    <div class="review-header">
                        <div>
                            <h4 class="reviewer-name">${escapeHTML(r.student_name)}</h4>
                            <span class="reviewer-course">${escapeHTML(r.course)}</span>
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
            container.innerHTML = `
                <p style="grid-column:1/-1; text-align:center; padding:2rem; color:var(--color-error);">
                    <svg class="fas fa-exclamation-circle" aria-hidden="true" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Free 7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) Copyright 2026 Fonticons, Inc. --><path fill="currentColor" d="M256 512a256 256 0 1 1 0-512 256 256 0 1 1 0 512zm0-192a32 32 0 1 0 0 64 32 32 0 1 0 0-64zm0-192c-18.2 0-32.7 15.5-31.4 33.7l7.4 104c.9 12.6 11.4 22.3 23.9 22.3 12.6 0 23-9.7 23.9-22.3l7.4-104c1.3-18.2-13.1-33.7-31.4-33.7z"/></svg>
                    Unable to load reviews right now. Please refresh the page.
                </p>`;
        }
    }


    // ════════════════════════════════════════════════════════════════════════════
    //  2. SUBMIT A REVIEW
    // ════════════════════════════════════════════════════════════════════════════

    function initReviewForm() {
        const form      = document.getElementById("student-review-form");
        const alert     = document.getElementById("review-form-alert");
        const submitBtn = document.getElementById("review-submit-btn");
        if (!form) return;

        // ── Alert helper ─────────────────────────────────────────────────────────
        function showAlert(type, html) {
            if (!alert) return;
            alert.innerHTML = html;
            alert.className = `form-alert ${type}`;
            alert.style.display = "block";
            alert.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }

        // ── Button state helpers ─────────────────────────────────────────────────
        function setLoading(isLoading) {
            if (!submitBtn) return;
            submitBtn.disabled = isLoading;
            const txt = submitBtn.querySelector(".btn-text");
            const spn = submitBtn.querySelector(".btn-spinner");
            if (txt) txt.style.display = isLoading ? "none" : "inline-block";
            if (spn) spn.style.display = isLoading ? "inline-flex" : "none";
        }

        // ── Form submit ──────────────────────────────────────────────────────────
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            // If no backend configured, inform the user
            if (!BACKEND_URL) {
                showAlert("error", '<svg class="fas fa-info-circle" aria-hidden="true" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Free 7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) Copyright 2026 Fonticons, Inc. --><path fill="currentColor" d="M256 512a256 256 0 1 0 0-512 256 256 0 1 0 0 512zM224 160a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm-8 64l48 0c13.3 0 24 10.7 24 24l0 88 8 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-80 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l24 0 0-64-24 0c-13.3 0-24-10.7-24-24s10.7-24 24-24z"/></svg> Reviews are not available yet. Please check back soon!');
                return;
            }

            // Hide any previous alert
            if (alert) alert.style.display = "none";

            // Collect values
            const fd = new FormData(form);
            const payload = {
                student_name: (fd.get("student_name") || "").trim(),
                course:       (fd.get("course")       || "").trim(),
                rating:       parseInt(fd.get("rating") || "0", 10),
                title:        (fd.get("title")         || "").trim() || null,
                body:         (fd.get("body")          || "").trim(),
            };

            // Client-side validation
            if (!payload.student_name) {
                return showAlert("error", '<svg class="fas fa-exclamation-circle" aria-hidden="true" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Free 7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) Copyright 2026 Fonticons, Inc. --><path fill="currentColor" d="M256 512a256 256 0 1 1 0-512 256 256 0 1 1 0 512zm0-192a32 32 0 1 0 0 64 32 32 0 1 0 0-64zm0-192c-18.2 0-32.7 15.5-31.4 33.7l7.4 104c.9 12.6 11.4 22.3 23.9 22.3 12.6 0 23-9.7 23.9-22.3l7.4-104c1.3-18.2-13.1-33.7-31.4-33.7z"/></svg> Please enter your name.');
            }
            if (!payload.course) {
                return showAlert("error", '<svg class="fas fa-exclamation-circle" aria-hidden="true" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Free 7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) Copyright 2026 Fonticons, Inc. --><path fill="currentColor" d="M256 512a256 256 0 1 1 0-512 256 256 0 1 1 0 512zm0-192a32 32 0 1 0 0 64 32 32 0 1 0 0-64zm0-192c-18.2 0-32.7 15.5-31.4 33.7l7.4 104c.9 12.6 11.4 22.3 23.9 22.3 12.6 0 23-9.7 23.9-22.3l7.4-104c1.3-18.2-13.1-33.7-31.4-33.7z"/></svg> Please select a course.');
            }
            if (!payload.rating || payload.rating < 1 || payload.rating > 5) {
                return showAlert("error", '<svg class="fas fa-exclamation-circle" aria-hidden="true" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Free 7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) Copyright 2026 Fonticons, Inc. --><path fill="currentColor" d="M256 512a256 256 0 1 1 0-512 256 256 0 1 1 0 512zm0-192a32 32 0 1 0 0 64 32 32 0 1 0 0-64zm0-192c-18.2 0-32.7 15.5-31.4 33.7l7.4 104c.9 12.6 11.4 22.3 23.9 22.3 12.6 0 23-9.7 23.9-22.3l7.4-104c1.3-18.2-13.1-33.7-31.4-33.7z"/></svg> Please select a star rating (1–5).');
            }
            if (!payload.body || payload.body.length < 10) {
                return showAlert("error", '<svg class="fas fa-exclamation-circle" aria-hidden="true" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Free 7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) Copyright 2026 Fonticons, Inc. --><path fill="currentColor" d="M256 512a256 256 0 1 1 0-512 256 256 0 1 1 0 512zm0-192a32 32 0 1 0 0 64 32 32 0 1 0 0-64zm0-192c-18.2 0-32.7 15.5-31.4 33.7l7.4 104c.9 12.6 11.4 22.3 23.9 22.3 12.6 0 23-9.7 23.9-22.3l7.4-104c1.3-18.2-13.1-33.7-31.4-33.7z"/></svg> Your review must be at least 10 characters.');
            }

            // Submitting state
            setLoading(true);
            showAlert("pending", '<svg class="fas fa-circle-notch fa-spin" aria-hidden="true" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Free 7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) Copyright 2026 Fonticons, Inc. --><path fill="currentColor" d="M222.7 32.1c5 16.9-4.6 34.8-21.5 39.8-79.3 23.6-137.1 97.1-137.1 184.1 0 106 86 192 192 192s192-86 192-192c0-86.9-57.8-160.4-137.1-184.1-16.9-5-26.6-22.9-21.5-39.8s22.9-26.6 39.8-21.5C434.9 42.1 512 140 512 256 512 397.4 397.4 512 256 512S0 397.4 0 256c0-116 77.1-213.9 182.9-245.4 16.9-5 34.8 4.6 39.8 21.5z"/></svg> Submitting your review…');

            try {
                const res = await fetch(`${BACKEND_URL}/api/reviews`, {
                    method:  "POST",
                    headers: { "Content-Type": "application/json" },
                    body:    JSON.stringify(payload),
                });

                const data = await res.json().catch(() => ({}));

                if (res.ok || res.status === 201) {
                    // ── Success ───────────────────────────────────────────────────
                    showAlert("success",
                        '<svg class="fas fa-check-circle" aria-hidden="true" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Free 7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) Copyright 2026 Fonticons, Inc. --><path fill="currentColor" d="M256 512a256 256 0 1 1 0-512 256 256 0 1 1 0 512zM374 145.7c-10.7-7.8-25.7-5.4-33.5 5.3L221.1 315.2 169 263.1c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l72 72c5 5 11.8 7.5 18.8 7s13.4-4.1 17.5-9.8L379.3 179.2c7.8-10.7 5.4-25.7-5.3-33.5z"/></svg> ' +
                        (data.message || "Thank you! Your review will appear after approval.")
                    );
                    form.reset();

                    // Reset char counter if present
                    const counter = document.getElementById("body-char-counter");
                    if (counter) counter.textContent = "0 / 2000";

                } else if (res.status === 429) {
                    // ── Rate limited ──────────────────────────────────────────────
                    showAlert("error",
                        '<svg class="fas fa-clock" aria-hidden="true" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Free 7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) Copyright 2026 Fonticons, Inc. --><path fill="currentColor" d="M256 0a256 256 0 1 1 0 512 256 256 0 1 1 0-512zM232 120l0 136c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2 280 120c0-13.3-10.7-24-24-24s-24 10.7-24 24z"/></svg> Too many submissions. Please wait a moment and try again.'
                    );

                } else {
                    // ── Validation / server error ─────────────────────────────────
                    const msg = (typeof data.error === "string")
                        ? data.error
                        : "Something went wrong. Please check your input and try again.";
                    showAlert("error", `<svg class="fas fa-times-circle" aria-hidden="true" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Free 7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) Copyright 2026 Fonticons, Inc. --><path fill="currentColor" d="M256 512a256 256 0 1 0 0-512 256 256 0 1 0 0 512zM167 167c9.4-9.4 24.6-9.4 33.9 0l55 55 55-55c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-55 55 55 55c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-55-55-55 55c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l55-55-55-55c-9.4-9.4-9.4-24.6 0-33.9z"/></svg> ${escapeHTML(msg)}`);
                }

            } catch (networkErr) {
                // ── Network error ────────────────────────────────────────────────
                showAlert("error",
                    '<svg class="fas fa-wifi" aria-hidden="true" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><!--! Font Awesome Free 7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) Copyright 2026 Fonticons, Inc. --><path fill="currentColor" d="M288 96c-90.9 0-173.2 36-233.7 94.6-12.7 12.3-33 12-45.2-.7s-12-33 .7-45.2C81.7 74.9 179.9 32 288 32S494.3 74.9 566.3 144.7c12.7 12.3 13 32.6 .7 45.2s-32.6 13-45.2 .7C461.2 132 378.9 96 288 96zM240 432a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zM168 326.2c-11.7 13.3-31.9 14.5-45.2 2.8s-14.5-31.9-2.8-45.2C161 237.4 221.1 208 288 208s127 29.4 168 75.8c11.7 13.3 10.4 33.5-2.8 45.2s-33.5 10.4-45.2-2.8C378.6 292.9 335.8 272 288 272s-90.6 20.9-120 54.2z"/></svg> Network error. Please check your connection and try again, ' +
                    'or reach us at <a href="mailto:info@mindinfluencer.in">info@mindinfluencer.in</a>.'
                );
            } finally {
                setLoading(false);
            }
        });
    }

    // ════════════════════════════════════════════════════════════════════════════
    //  3. COURSE FILTER PILLS
    // ════════════════════════════════════════════════════════════════════════════

    function initReviewFilters() {
        const filterBtns = document.querySelectorAll(".filter-btn");
        filterBtns.forEach((btn) => {
            btn.addEventListener("click", () => {
                filterBtns.forEach((b) => {
                    b.classList.remove("active");
                    b.setAttribute("aria-pressed", "false");
                });
                btn.classList.add("active");
                btn.setAttribute("aria-pressed", "true");
                loadReviews(btn.dataset.filter === "all" ? "" : btn.dataset.filter);
            });
        });
    }
    
    // Character counter for review body
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
    initReviewFilters();
    initReviewForm();
});
