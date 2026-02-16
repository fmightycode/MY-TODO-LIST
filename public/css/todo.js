
  function updateProgress() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const total = checkboxes.length;
    let checked = 0;

    checkboxes.forEach(box => {
      if (box.checked) checked++;
    });

    const percent = total === 0 ? 0 : Math.round((checked / total) * 100);
    const progressText = document.getElementById("progressText");

    progressText.innerText = `Progress: ${percent}% completed`;

    // Color logic

    if (percent < 30) {
      progressText.classList.remove("in-progress");
      progressText.classList.remove("completed");
      progressText.classList.add("start");
    }
    
    else if (percent  < 100){ 
        progressText.classList.add("in-progress");
        progressText.classList.remove("start");
        progressText.classList.remove("completed");
    }

    else {
      progressText.classList.add("completed");
      progressText.classList.remove("start");
      progressText.classList.remove("in-progress");
    }
  }

  // Run on load
  updateProgress();

  // Update on checkbox change
  document.addEventListener("change", function (e) {
    if (e.target.type === "checkbox") {
      updateProgress();
    }
  });

