/*
 * Loads content.json at runtime and fills in every element marked with
 * data-field="dot.path.into.json" (plus a couple of special-case attributes
 * below). Edit content.json (directly, or via the /admin CMS panel) to
 * change text/links across the site without touching this HTML file.
 */
(function () {
  fetch("content.json", { cache: "no-store" })
    .then(function (r) { return r.json(); })
    .then(applyContent)
    .catch(function (err) { console.warn("content.json failed to load:", err); });

  function getPath(obj, path) {
    return path.split(".").reduce(function (o, k) { return (o || {})[k]; }, obj);
  }

  function toTelHref(display) {
    return "tel:" + display.replace(/[^\d+]/g, "");
  }

  function toWaHref(display, message) {
    var digits = display.replace(/[^\d]/g, "");
    return "https://wa.me/" + digits + "?text=" + encodeURIComponent(message || "");
  }

  function applyContent(data) {
    document.querySelectorAll("[data-field]").forEach(function (el) {
      var path = el.getAttribute("data-field");
      var value = getPath(data, path);
      if (value == null) return;

      var target = el.getAttribute("data-field-target") || "text";
      if (target === "html") {
        el.innerHTML = value;
      } else if (target === "href") {
        el.setAttribute("href", value);
      } else {
        el.textContent = value;
      }

      if (el.hasAttribute("data-field-tel")) {
        el.setAttribute("href", toTelHref(value));
      }
    });

    var waNumber = getPath(data, "whatsapp.number");
    var waMessage = getPath(data, "whatsapp.message");
    if (waNumber) {
      var waHref = toWaHref(waNumber, waMessage);
      document.querySelectorAll("[data-field-wa-href]").forEach(function (el) {
        el.setAttribute("href", waHref);
      });
    }
  }
})();
