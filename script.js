document.addEventListener('DOMContentLoaded', () => {
    // Mobile Navigation Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileNav = document.querySelector('.mobile-nav');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    const navbar = document.getElementById('navbar');
    
    if (mobileMenuBtn && mobileNav) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileNav.classList.toggle('active');
            const icon = mobileMenuBtn.querySelector('i');
            if (mobileNav.classList.contains('active')) {
                icon.classList.replace('fa-bars', 'fa-times');
            } else {
                icon.classList.replace('fa-times', 'fa-bars');
            }
        });

        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileNav.classList.remove('active');
                const icon = mobileMenuBtn.querySelector('i');
                icon.classList.replace('fa-times', 'fa-bars');
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
                showAlert('error', '<i class="fas fa-exclamation-circle"></i> Please fill in all required fields correctly.');
                return;
            }

            // ── Submitting state ──────────────────────────────────────────────
            submitBtn.disabled   = true;
            btnText.style.display    = 'none';
            btnSpinner.style.display = 'inline-flex';
            showAlert('pending', '<i class="fas fa-circle-notch fa-spin"></i> Submitting your enquiry\u2026');

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
                        '<i class="fas fa-check-circle"></i> ' +
                        'Thank you! Your enquiry has been received. We\u2019ll be in touch with you soon.'
                    );

                    // ── Firebase Analytics: track successful enquiry submission ──
                    // Only fires on a confirmed HTTP 2xx response from Formspree.
                    // Failed submissions (validation errors, network issues) are NOT tracked.
                    if (window._firebaseAnalytics) {
                        window._firebaseAnalytics.logEvent('contact_form_submit', {
                            course: courseField ? courseField.value : undefined
                        });
                    }

                    form.reset();
                } else {
                    // ── Server-side error (4xx / 5xx) ─────────────────────────
                    const data = await response.json().catch(() => ({}));
                    const msg  = (data.errors && data.errors.map(err => err.message).join(', '))
                                 || 'Something went wrong. Please try again or contact us directly.';
                    showAlert('error', '<i class="fas fa-times-circle"></i> ' + msg);
                }
            } catch (networkError) {
                // ── Network / connectivity error ──────────────────────────────
                showAlert('error',
                    '<i class="fas fa-wifi"></i> ' +
                    'Unable to send your enquiry. Please check your connection and try again, ' +
                    'or reach us directly at <a href="mailto:info.mindinfluencer@gmail.com">info.mindinfluencer@gmail.com</a>.'
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
                ? `<i class="fas fa-star" aria-hidden="true"></i>`
                : `<i class="far fa-star" aria-hidden="true"></i>`;
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
                    <i class="far fa-comment-dots" style="font-size:2.5rem; display:block; margin-bottom:1rem;" aria-hidden="true"></i>
                    Student reviews are coming soon!<br>
                    <span style="font-size:0.9rem;">Check back after our full launch.</span>
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
                        <i class="far fa-comment-dots" style="font-size:2.5rem; display:block; margin-bottom:1rem;" aria-hidden="true"></i>
                        No reviews yet${courseFilter ? " for " + escapeHTML(courseFilter) : ""}.<br>
                        <span style="font-size:0.9rem;">Be the first to share your experience!</span>
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
                    <i class="fas fa-exclamation-circle" aria-hidden="true"></i>
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
                showAlert("error", '<i class="fas fa-info-circle"></i> Reviews are not available yet. Please check back soon!');
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
                return showAlert("error", '<i class="fas fa-exclamation-circle"></i> Please enter your name.');
            }
            if (!payload.course) {
                return showAlert("error", '<i class="fas fa-exclamation-circle"></i> Please select a course.');
            }
            if (!payload.rating || payload.rating < 1 || payload.rating > 5) {
                return showAlert("error", '<i class="fas fa-exclamation-circle"></i> Please select a star rating (1–5).');
            }
            if (!payload.body || payload.body.length < 10) {
                return showAlert("error", '<i class="fas fa-exclamation-circle"></i> Your review must be at least 10 characters.');
            }

            // Submitting state
            setLoading(true);
            showAlert("pending", '<i class="fas fa-circle-notch fa-spin"></i> Submitting your review…');

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
                        '<i class="fas fa-check-circle"></i> ' +
                        (data.message || "Thank you! Your review will appear after approval.")
                    );
                    form.reset();

                    // Reset char counter if present
                    const counter = document.getElementById("body-char-counter");
                    if (counter) counter.textContent = "0 / 2000";

                } else if (res.status === 429) {
                    // ── Rate limited ──────────────────────────────────────────────
                    showAlert("error",
                        '<i class="fas fa-clock"></i> Too many submissions. Please wait a moment and try again.'
                    );

                } else {
                    // ── Validation / server error ─────────────────────────────────
                    const msg = (typeof data.error === "string")
                        ? data.error
                        : "Something went wrong. Please check your input and try again.";
                    showAlert("error", `<i class="fas fa-times-circle"></i> ${escapeHTML(msg)}`);
                }

            } catch (networkErr) {
                // ── Network error ────────────────────────────────────────────────
                showAlert("error",
                    '<i class="fas fa-wifi"></i> Network error. Please check your connection and try again, ' +
                    'or reach us at <a href="mailto:info.mindinfluencer@gmail.com">info.mindinfluencer@gmail.com</a>.'
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
