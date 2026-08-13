/**
 * frontend_example.js
 * ────────────────────────────────────────────────────────────────────────────
 * Example JavaScript for the Mind Influencer static site (script.js).
 *
 * This shows how to:
 *   1. Load approved reviews via GET /api/reviews
 *   2. Submit a new review via POST /api/reviews
 *
 * Replace BACKEND_URL with your deployed backend address before going live.
 * ────────────────────────────────────────────────────────────────────────────
 */

// ── Configuration ─────────────────────────────────────────────────────────────
// Local development: Flask runs on port 5001, static site on any port.
// Production: replace with https://api.mindinfluencer.in (or wherever you host it).
const BACKEND_URL = "http://localhost:5001";

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

/**
 * Fetches approved reviews from the backend and renders them into
 * the element with id="reviews-container".
 *
 * @param {string} courseFilter  Optional course name to filter by.
 */
async function loadReviews(courseFilter = "") {
    const container = document.getElementById("reviews-container");
    if (!container) return;

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

        const { reviews } = await res.json();

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

/**
 * Wires up the "Write a Review" form (id="student-review-form") to POST
 * to the Flask backend.
 *
 * Expected HTML elements (matching the Mind Influencer index.html):
 *   <form id="student-review-form">
 *     <input  name="student_name" ...>
 *     <select name="course" ...>
 *     <input  name="rating" type="radio" ...>   ← one value per star
 *     <input  name="title" ...>                  ← optional
 *     <textarea name="body" ...>
 *   </form>
 *   <div id="review-form-alert" ...></div>
 *   <button id="review-submit-btn" ...>
 *     <span class="btn-text">Submit Review</span>
 *     <span class="btn-spinner" style="display:none;">...</span>
 *   </button>
 */
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

        // Client-side validation (server will validate again)
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


// ════════════════════════════════════════════════════════════════════════════
//  4. ENTRY POINT — Call from DOMContentLoaded in script.js
// ════════════════════════════════════════════════════════════════════════════

// Replace the current reviews block in your script.js DOMContentLoaded handler
// with these three calls:

document.addEventListener("DOMContentLoaded", () => {
    loadReviews();        // load approved reviews on page load
    initReviewFilters();  // wire up course filter pills
    initReviewForm();     // wire up submission form
});
