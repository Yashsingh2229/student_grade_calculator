/* ==========================================================================
   STUDENT MARKS & GRADE CALCULATOR - JAVASCRIPT
   Handles:
   1. Light and Dark Theme Toggle with localStorage persistence
   2. Input validation and error/success messaging
   3. Marks, percentage, grade, and remark calculations
   4. Dynamic UI updates for Result Card, Progress Bar, and Subject Table
   ========================================================================== */

// Wait for the DOM to fully load before attaching event listeners
document.addEventListener('DOMContentLoaded', function () {

  /* ------------------------------------------------------------------------
     1. THEME TOGGLE (LIGHT / DARK MODE)
     ------------------------------------------------------------------------ */
  const themeToggleBtn = document.getElementById('themeToggleBtn');

  // Helper function to update the button's icon and label
  function updateThemeButton(isDark) {
    if (isDark) {
      themeToggleBtn.textContent = '🌙 Dark';
    } else {
      themeToggleBtn.textContent = '☀️ Light';
    }
  }

  // Check saved theme in localStorage on initial page load
  const savedTheme = localStorage.getItem('theme');

  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    updateThemeButton(true);
  } else {
    document.body.classList.remove('dark-mode');
    updateThemeButton(false);
  }

  // Simple event listener to toggle theme on button click
  themeToggleBtn.addEventListener('click', function () {
    // Toggle the dark-mode class on the body element
    document.body.classList.toggle('dark-mode');

    const isDarkMode = document.body.classList.contains('dark-mode');

    // Save the selected theme in localStorage so it persists after page refresh
    if (isDarkMode) {
      localStorage.setItem('theme', 'dark');
      updateThemeButton(true);
    } else {
      localStorage.setItem('theme', 'light');
      updateThemeButton(false);
    }
  });


  /* ------------------------------------------------------------------------
     2. FORM & RESULT ELEMENTS SELECTION
     ------------------------------------------------------------------------ */
  const calculatorForm = document.getElementById('calculatorForm');
  const resetBtn = document.getElementById('resetBtn');
  const messageBox = document.getElementById('messageBox');

  // Input Fields
  const studentNameInput = document.getElementById('studentName');
  const rollNumberInput = document.getElementById('rollNumber');
  const marksMathInput = document.getElementById('marksMath');
  const marksScienceInput = document.getElementById('marksScience');
  const marksEnglishInput = document.getElementById('marksEnglish');
  const marksSocialInput = document.getElementById('marksSocial');
  const marksComputerInput = document.getElementById('marksComputer');

  // Result Card Elements
  const resultPlaceholder = document.getElementById('resultPlaceholder');
  const resultDetails = document.getElementById('resultDetails');
  const statusBadge = document.getElementById('statusBadge');
  const resStudentName = document.getElementById('resStudentName');
  const resRollNumber = document.getElementById('resRollNumber');
  const resTotalMarks = document.getElementById('resTotalMarks');
  const resPercentage = document.getElementById('resPercentage');
  const resGrade = document.getElementById('resGrade');
  const resRemarks = document.getElementById('resRemarks');
  const progressBar = document.getElementById('progressBar');
  const progressText = document.getElementById('progressText');
  const subjectTableBody = document.getElementById('subjectTableBody');


  /* ------------------------------------------------------------------------
     3. HELPER FUNCTIONS: NOTIFICATIONS & GRADING LOGIC
     ------------------------------------------------------------------------ */

  // Function to show notification messages (Error or Success)
  function showMessage(text, type) {
    messageBox.textContent = text;
    messageBox.className = 'message-box ' + type;
    messageBox.style.display = 'block';

    // Auto-scroll to message box smoothly
    messageBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // Function to clear messages
  function clearMessage() {
    messageBox.style.display = 'none';
    messageBox.textContent = '';
    messageBox.className = 'message-box';
  }

  // Determine letter grade based on percentage score
  function getGrade(score) {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  }

  // Get CSS class badge name for a given grade
  function getBadgeClass(grade) {
    switch (grade) {
      case 'A+': return 'badge-a-plus';
      case 'A':  return 'badge-a';
      case 'B':  return 'badge-b';
      case 'C':  return 'badge-c';
      case 'D':  return 'badge-d';
      default:   return 'badge-f';
    }
  }

  // Get encouraging performance remark based on grade and pass status
  function getRemarks(grade, hasPassed) {
    if (!hasPassed) {
      return 'Needs improvement. Please focus on the failed subject(s) and consult your teacher for remedial guidance.';
    }
    switch (grade) {
      case 'A+': return 'Outstanding performance! Exemplary mastery of all subject concepts.';
      case 'A':  return 'Excellent academic achievement! Consistent and commendable hard work.';
      case 'B':  return 'Very good effort! Solid grasp of concepts with room to achieve top honors.';
      case 'C':  return 'Good effort! Continue to work consistently to enhance your understanding.';
      case 'D':  return 'Pass score achieved. Consistent daily revision is strongly recommended.';
      default:   return 'Needs improvement. Dedicated revision required.';
    }
  }


  /* ------------------------------------------------------------------------
     4. FORM SUBMISSION & CALCULATION HANDLER
     ------------------------------------------------------------------------ */
  calculatorForm.addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent default page reload
    clearMessage();

    // 1. Validate Student Info
    const studentName = studentNameInput.value.trim();
    const rollNumber = rollNumberInput.value.trim();

    if (!studentName) {
      showMessage('Please enter the student\'s name.', 'error');
      studentNameInput.focus();
      return;
    }

    if (!rollNumber) {
      showMessage('Please enter the student\'s Roll / ID Number.', 'error');
      rollNumberInput.focus();
      return;
    }

    // 2. Validate Subject Marks
    const subjects = [
      { name: 'Mathematics', input: marksMathInput },
      { name: 'Science', input: marksScienceInput },
      { name: 'English', input: marksEnglishInput },
      { name: 'Social Studies', input: marksSocialInput },
      { name: 'Computer Science', input: marksComputerInput }
    ];

    const processedSubjects = [];

    for (let i = 0; i < subjects.length; i++) {
      const subject = subjects[i];
      const valStr = subject.input.value.trim();

      if (valStr === '') {
        showMessage(`Please enter marks for ${subject.name}.`, 'error');
        subject.input.focus();
        return;
      }

      const numVal = parseFloat(valStr);

      if (isNaN(numVal) || numVal < 0 || numVal > 100) {
        showMessage(`Marks for ${subject.name} must be a valid number between 0 and 100.`, 'error');
        subject.input.focus();
        return;
      }

      const subjectGrade = getGrade(numVal);
      const isSubjectPass = numVal >= 35; // 35 marks passing criterion

      processedSubjects.push({
        name: subject.name,
        marks: numVal,
        maxMarks: 100,
        grade: subjectGrade,
        passed: isSubjectPass
      });
    }

    // 3. Perform Calculations
    const totalMarks = processedSubjects.reduce((sum, item) => sum + item.marks, 0);
    const maxMarks = processedSubjects.length * 100;
    const percentage = (totalMarks / maxMarks) * 100;
    const formattedPercentage = percentage.toFixed(2);

    // Check if student passed all individual subjects (>= 35 marks each)
    const passedAllSubjects = processedSubjects.every(item => item.passed);
    const isOverallPass = passedAllSubjects && (percentage >= 50);

    const overallGrade = isOverallPass ? getGrade(percentage) : 'F';
    const remarks = getRemarks(overallGrade, isOverallPass);

    // 4. Update Result Card UI
    resStudentName.textContent = studentName;
    resRollNumber.textContent = rollNumber;
    resTotalMarks.textContent = totalMarks;
    resPercentage.textContent = formattedPercentage;
    resGrade.textContent = overallGrade;
    resRemarks.textContent = remarks;

    // Status Badge Styling
    if (isOverallPass) {
      statusBadge.textContent = 'PASSED';
      statusBadge.className = 'status-badge status-passed';
      resGrade.className = 'metric-value grade-display';
      resRemarks.parentElement.className = 'remarks-box';
    } else {
      statusBadge.textContent = 'FAILED';
      statusBadge.className = 'status-badge status-failed';
      resGrade.className = 'metric-value grade-display grade-fail';
      resRemarks.parentElement.className = 'remarks-box remarks-fail';
    }

    // Progress Bar Update
    progressBar.style.width = Math.min(percentage, 100) + '%';
    progressText.textContent = formattedPercentage + '%';
    if (isOverallPass) {
      progressBar.className = 'progress-bar-fill';
    } else {
      progressBar.className = 'progress-bar-fill bar-fail';
    }

    // 5. Populate Subject-Wise Result Table
    subjectTableBody.innerHTML = ''; // Clear previous table rows

    processedSubjects.forEach(function (sub) {
      const row = document.createElement('tr');

      const statusTag = sub.passed 
        ? '<span class="pass-tag">Pass</span>' 
        : '<span class="fail-tag">Fail</span>';

      const badgeClass = getBadgeClass(sub.grade);

      row.innerHTML = `
        <td><strong>${sub.name}</strong></td>
        <td>${sub.maxMarks}</td>
        <td>${sub.marks}</td>
        <td>${sub.marks}%</td>
        <td><span class="badge ${badgeClass}">${sub.grade}</span></td>
        <td>${statusTag}</td>
      `;

      subjectTableBody.appendChild(row);
    });

    // 6. Reveal Result Card
    resultPlaceholder.style.display = 'none';
    resultDetails.style.display = 'block';

    // Show Success Message
    showMessage(`Success! Result calculated for ${studentName} (${formattedPercentage}% - Grade ${overallGrade}).`, 'success');
  });


  /* ------------------------------------------------------------------------
     5. RESET FORM HANDLER
     ------------------------------------------------------------------------ */
  resetBtn.addEventListener('click', function () {
    calculatorForm.reset();
    clearMessage();

    // Reset Result Card to Placeholder State
    resultPlaceholder.style.display = 'block';
    resultDetails.style.display = 'none';

    statusBadge.textContent = 'Awaiting Input';
    statusBadge.className = 'status-badge status-pending';

    progressBar.style.width = '0%';
    progressBar.className = 'progress-bar-fill';
    progressText.textContent = '0%';

    subjectTableBody.innerHTML = '';
    studentNameInput.focus();
  });

});
