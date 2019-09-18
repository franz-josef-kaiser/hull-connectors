/* global window, jQuery, swal */

jQuery(function boot($) {
  require("peity");
  $(".line").peity("line");
  $("[data-href]").click(function clickHref() {
    const url = $(this).attr("data-href");
    swal(
      {
        title: "Fetch all contacts",
        text: "Re-Fetch all Stripe Customer and Charge history?",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes, fetch all!",
        closeOnConfirm: false
      },
      function confirm(isConfirm) {
        if (isConfirm) {
          $.post(url + window.location.search);
          swal(
            "Fetching started",
            "The Intercom contacts will be fetched shortly.",
            "success"
          );
        }
      }
    );
  });
});

window.hullAuthCompleted = function authCompleted() {
  window.location.href = window.location.href.replace("&reset=true", "");
};
