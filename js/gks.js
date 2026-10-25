/* ============ EDIT THIS SECTION ============ */
const EMAIL = "educationconceptssolutions@gmail.com";

// Add, remove or edit jobs here. They appear as cards automatically.
const JOBS = [
  {
    img: "images/media.png",
    title: "Creative Media Lead",
    sub: "Photography & Videography",
    location: "Nakuru, Kenya",
    type: "Full-time",
    points: [
      "2–3 years experience in media production",
      "Strong photography/videography portfolio",
      "Degree/Diploma in Film, Media, Photography (preferred)"
    ],
    submit: "Portfolio/Showreel link (required), comprehensive CV and cover letter"
  }
];

// Past placements. Add an image path (e.g. "images/placement1.jpg") to show a photo.
const PAST = [
  { role: "Head Teacher", place: "Private primary school", img: "images/admin.png" },
  { role: "Deputy Principal", place: "Secondary school", img: "images/gk.jpg" },
  { role: "Accountant", place: "Educational institution", img: "images/Accountant.png" },
  { role: "ICT $ Robotics Teacher", place: "Primary School", img: "images/robotics.png" },
  { role: "Cashier", place: "Hotel Start up", img: "images/cashier.jpeg" },
  { role: "Administrator", place: "College", img: "images/gk.jpg" }
];
/* ============================================ */

const $ = (s, el = document) => el.querySelector(s);

// Jobs
const jobGrid = $("#jobGrid");
if (!JOBS.length) {
  jobGrid.innerHTML = '<div class="empty">No open jobs right now. Check back soon.</div>';
}
JOBS.forEach(j => {
  const subject = encodeURIComponent("Application: " + j.title);

  const body = encodeURIComponent(
    "Hello,\n\nI am applying for the " + j.title + 
    " position.\n\nPlease find attached: " + j.submit + 
    ".\n\nThank you."
  );
  const card = document.createElement("article");
  card.className = "card";

  card.innerHTML =
   // Job image
    (j.img
      ? "<img class='job-image' src='" + j.img +
        "' alt='" + j.title + "' loading='lazy'>"
      : "") +

    "<h3>" + j.title + "</h3>" +

    "<div class='tags'>" +
    "<span>" + j.sub + "</span>" +
    "<span>" + j.location + "</span>" +
    "<span>" + j.type + "</span>" +
    "</div>" +

    "<ul>" + j.points.map(p => "<li>" + p + "</li>").join("") +
     "</ul>" +

    "<a class='btn btn-purple' href='mailto:" + EMAIL +
     "?subject=" + subject +
      "&body=" + body + "'>Apply here</a>";
  jobGrid.appendChild(card);
});

// Gallery
const gallery = $("#gallery");

PAST.forEach(p => {

  const fig = document.createElement("figure");
  
  fig.className = "shot";

  fig.innerHTML =
    (p.img ? "<img src='" +
         p.img + "' alt='" +
          p.role + "' loading='lazy'>" : "") +
    "<figcaption><b>" + 
    p.role + "</b>" + p.place +
     "</figcaption>";

  gallery.appendChild(fig);
});

// Mobile menu
const menu = $("#menu"), menuBtn = $("#menuBtn");
menuBtn.addEventListener("click", () => {
  const open = menu.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", open);
});
menu.addEventListener("click", e => { if (e.target.tagName === "A") menu.classList.remove("open"); });

// Modal
let lastFocus;
function openModal(id) {
  const m = document.getElementById(id);
  lastFocus = document.activeElement;
  m.hidden = false;
  document.body.style.overflow = "hidden";
  const first = m.querySelector("input"); if (first) first.focus();
}
function closeModal(m) {
  m.hidden = true;
  document.body.style.overflow = "";
  if (lastFocus) lastFocus.focus();
}
document.querySelectorAll("[data-open]").forEach(b =>
  b.addEventListener("click", () => openModal(b.dataset.open)));
document.querySelectorAll(".modal").forEach(m => {
  m.addEventListener("click", e => { if (e.target === m || e.target.hasAttribute("data-close")) closeModal(m); });
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape") document.querySelectorAll(".modal:not([hidden])").forEach(closeModal);
});

// Forms: open the visitor's email app with the details filled in.
// (A static site has no server. For a real backend, see the Formspree note in the README message.)
function sendMail(subject, lines) {
  window.location.href = "mailto:" + EMAIL + "?subject=" + encodeURIComponent(subject) +
    "&body=" + encodeURIComponent(lines.join("\n"));
}
$("#recruitForm").addEventListener("submit", e => {
  e.preventDefault();
  const d = Object.fromEntries(new FormData(e.target));
  sendMail("Recruitment request: " + d.position + " (" + d.org + ")", [
    "School/Institution: " + d.org,
    "Contact: " + d.contact,
    "Email: " + d.email,
    "Phone: " + d.phone,
    "Position: " + d.position,
    "Vacancies: " + d.count,
    "",
    "Details:", d.details || "-"
  ]);
  closeModal($("#recruitModal"));
  e.target.reset();
});
$("#contactForm").addEventListener("submit", e => {
  e.preventDefault();
  const d = Object.fromEntries(new FormData(e.target));
  sendMail("Website enquiry from " + d.name, ["Name: " + d.name, "Email: " + d.email, "", d.message]);
  e.target.reset();
});

$("#year").textContent = new Date().getFullYear();