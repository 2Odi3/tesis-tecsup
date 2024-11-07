$(document).ready(function() {
  console.log('jotaquery', jQuery);

  // Inicializa el menú
  $("#menu").metisMenu();

  // Toggle del menú lateral
  $(".nav-toggle-icon").on("click", function() {
    $(".wrapper").toggleClass("toggled");
  });

  $(".mobile-menu-button").on("click", function() {
    $(".wrapper").addClass("toggled");
  });

  // Resaltar el menú activo basado en la URL
  const currentUrl = window.location.href;
  $(".metismenu li a").filter(function() {
    return this.href === currentUrl;
  }).addClass("").parent().addClass("mm-active").parents("li").addClass("mm-show mm-active");

  // Manejo de eventos de búsqueda y filtros
  $(".btn-mobile-filter").on("click", function() {
    $(".filter-sidebar").removeClass("d-none");
  });

  $(".btn-mobile-filter-close").on("click", function() {
    $(".filter-sidebar").addClass("d-none");
  });

  $(".mobile-search-button").on("click", function() {
    $(".searchbar").addClass("full-search-bar");
  });

  $(".search-close-icon").on("click", function() {
    $(".searchbar").removeClass("full-search-bar");
  });

  // Botón para volver al principio
  $(window).on("scroll", function() {
    $(this).scrollTop() > 300 ? $(".back-to-top").fadeIn() : $(".back-to-top").fadeOut();
  });
  $(".back-to-top").on("click", function() {
    $("html, body").animate({ scrollTop: 0 }, 600);
    return false;
  });

  // Cambiar entre modos de tema
  $(".dark-mode-icon").on("click", function() {
    const icon = $(".mode-icon ion-icon");
    if (icon.attr("name") === 'sunny-outline') {
        icon.attr("name", "moon-outline");
        $("html").removeClass("dark-theme").addClass("light-theme");
    } else {
        icon.attr("name", "sunny-outline");
        $("html").removeClass("light-theme").addClass("dark-theme");
    }
});


  // Selector de temas
  $("#LightTheme").on("click", () => $("html").attr("class", "light-theme"));
  $("#DarkTheme").on("click", () => $("html").attr("class", "dark-theme"));
  $("#SemiDark").on("click", () => $("html").attr("class", "semi-dark"));

  // Cambiar colores de encabezado
  for (let i = 1; i <= 8; i++) {
    $(`#headercolor${i}`).on("click", function() {
      $("html").attr("class", `color-header headercolor${i}`);
    });
  }

  // Cambiar colores de la barra lateral
  for (let i = 1; i <= 8; i++) {
    $(`#sidebarcolor${i}`).on("click", function() {
      $("html").attr("class", `color-sidebar sidebarcolor${i}`);
    });
  }

  // Inicializa PerfectScrollbar
  new PerfectScrollbar(".header-notifications-list");

  // Inicializa tooltips
  $('[data-bs-toggle="tooltip"]').tooltip();
});
