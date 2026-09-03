(function () {
    try {
      var saved = localStorage.getItem('tcos-theme');
      if (saved === 'light') document.documentElement.setAttribute('data-theme', 'light');
    } catch (e) {}
  })();
