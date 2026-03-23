/**
 * EH STUDIO — Kalkulačka ceny webu
 * Multi-step, čisté JavaScript
 */

(function () {
  const stepsContainer = document.getElementById('calculator-steps');
  const progressBar = document.getElementById('calc-progress-bar');
  const stepDotsContainer = document.getElementById('calc-step-dots');
  const btnBack = document.getElementById('calc-btn-back');
  const totalPriceEl = document.getElementById('total-price');
  const btnOffer = document.getElementById('btn-offer');

  if (!stepsContainer || !totalPriceEl) return;

  const steps = [
    {
      id: 'strategy',
      questions: [
        {
          id: 'strategy',
          text: 'Máte jasno, co má váš web přinést?',
          subtext: 'Pomůžeme vám ujasnit, komu prodáváte, co říkáte a proč by si měl zákazník vybrat právě vás.',
          options: [
            { label: 'Ano, mám jasno', description: 'Vím, koho oslovuji a co chci webem dosáhnout.', value: 0, variant: 'green' },
            { label: 'Pomozte mi to nastavit', description: 'Chci jednoduchou strategii, která mi pomůže web postavit správně od začátku.', value: 3000, priceLabel: '+3 000 Kč', variant: 'blue' },
            { label: 'Strategii teď neřeším', description: 'Chci jen web a zbytek doladím později.', value: 0, variant: 'red' }
          ]
        }
      ]
    },
    {
      id: 'logo',
      questions: [
        {
          id: 'logo',
          text: 'Máte už hotové logo?',
          subtext: 'Logo je často první věc, podle které si zákazník vytvoří dojem o vaší značce.',
          options: [
            { label: 'Ano, logo už mám', description: 'Stačí ho použít v novém webu.', value: 0, variant: 'green' },
            { label: 'Chci nové logo', description: 'Navrhneme jednoduché, moderní logo, které bude fungovat na webu i jinde.', value: 3000, priceLabel: '+3 000 Kč', variant: 'blue', priceStyle: 'pill' },
            { label: 'Zatím to neřeším', description: 'Logo teď není priorita, řeším hlavně funkční web.', value: 0, variant: 'red' }
          ]
        }
      ]
    },
    {
      id: 'web-satisfaction',
      questions: [
        {
          id: 'web-satisfaction',
          text: 'Jak jste spokojení se svým webem?',
          subtext: 'Web je často první místo, kam si zákazník jde ověřit, kdo jste a co nabízíte.',
          options: [
            { label: 'Web mám, chci ho zkontrolovat', description: 'Potřebuji rychlý audit a návrhy na zlepšení.', value: 2000, priceLabel: '+2 000 Kč', variant: 'green', priceStyle: 'pill' },
            { label: 'Chci nový nebo lepší web', description: 'Současný web mi nestačí nebo potřebuji modernější řešení.', value: 5000, priceLabel: '+5 000 Kč', variant: 'blue', priceStyle: 'pill' },
            { label: 'Web teď neřeším', description: 'Momentálně to není priorita.', value: 0, variant: 'red' }
          ]
        }
      ]
    },
    {
      id: 'web-scope',
      questions: [
        {
          id: 'web-scope',
          text: 'Jak rozsáhlý web potřebujete?',
          subtext: 'Rozsah webu ovlivňuje množství obsahu, strukturu i celkovou náročnost.',
          options: [
            { label: 'Stačí mi jedna stránka', description: 'Jednoduchý web, kde je vše přehledně na jednom místě.', value: 0, variant: 'green' },
            { label: 'Potřebuji více stránek (5+)', description: 'Služby, o nás, kontakt a další podstránky.', value: 7000, priceLabel: '+7 000 Kč', variant: 'blue', priceStyle: 'pill' },
            { label: 'Potřebuji rozsáhlejší web', description: 'Větší projekt s více sekcemi a detailnějším obsahem.', value: 15000, priceLabel: '+15 000 Kč', variant: 'blue', priceStyle: 'pill' }
          ]
        }
      ]
    }
  ];

  let currentStep = 0;
  const answers = {};

  function renderStepContent(stepIndex) {
    const step = steps[stepIndex];
    const stepEl = document.createElement('div');
    stepEl.className = `calc-step-content ${stepIndex === currentStep ? 'active' : ''}`;
    stepEl.dataset.stepIndex = stepIndex;

    step.questions.forEach((q) => {
      const box = document.createElement('div');
      box.className = 'question-box';
      const subtextHtml = q.subtext ? `<p class="question-subtext">${q.subtext}</p>` : '';
      box.innerHTML = `<h3>${q.text}</h3>${subtextHtml}<div class="answer-options" data-question-id="${q.id}"></div>`;

      const optionsContainer = box.querySelector('.answer-options');
      q.options.forEach((opt, optIndex) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `answer-option answer-variant-${opt.variant || 'default'}`;
        btn.dataset.value = opt.value;
        btn.dataset.optionIndex = optIndex;
        const priceClass = opt.priceStyle === 'pill' ? 'option-price option-price-pill' : 'option-price option-price-highlight';
        const priceBadge = opt.priceLabel ? `<span class="${priceClass}">${opt.priceLabel}</span>` : '';
        btn.innerHTML = `
          <span class="option-content">
            <span class="option-label">${opt.label}</span>
            <span class="option-desc">${opt.description}</span>
            ${priceBadge}
          </span>
          <span class="option-check" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </span>
        `;
        btn.addEventListener('click', () => selectAnswer(q.id, opt.value, optIndex, optionsContainer, btn));
        optionsContainer.appendChild(btn);
      });

      stepEl.appendChild(box);
    });

    return stepEl;
  }

  function renderAllSteps() {
    stepsContainer.innerHTML = '';
    steps.forEach((_, i) => {
      const stepEl = renderStepContent(i);
      stepsContainer.appendChild(stepEl);
    });
  }

  function showStep(index) {
    currentStep = index;
    stepsContainer.querySelectorAll('.calc-step-content').forEach((el, i) => {
      el.classList.toggle('active', i === index);
    });
    restoreSelections(steps[index]);
    updateProgress();
    updateNavButtons();
  }

  function restoreSelections(step) {
    step.questions.forEach((q) => {
      const a = answers[q.id];
      if (a && a.optionIndex !== undefined) {
        const optionsContainer = stepsContainer.querySelector(`.calc-step-content.active .answer-options[data-question-id="${q.id}"]`);
        if (optionsContainer) {
          optionsContainer.querySelectorAll('.answer-option').forEach((btn) => {
            btn.classList.toggle('selected', parseInt(btn.dataset.optionIndex, 10) === a.optionIndex);
          });
        }
      }
    });
  }

  function selectAnswer(questionId, value, optionIndex, optionsContainer, selectedBtn) {
    answers[questionId] = { value, optionIndex };
    optionsContainer.querySelectorAll('.answer-option').forEach((btn) => btn.classList.remove('selected'));
    selectedBtn.classList.add('selected');
    updatePrice();

    if (currentStep < steps.length - 1) {
      setTimeout(() => showStep(currentStep + 1), 150);
    }
  }

  function calculateTotal() {
    return Object.values(answers).reduce((sum, a) => sum + (a && a.value !== undefined ? a.value : 0), 0);
  }

  function updatePrice() {
    const total = calculateTotal();
    totalPriceEl.textContent = `${total.toLocaleString('cs-CZ')} Kč`;
    totalPriceEl.classList.remove('animate');
    void totalPriceEl.offsetWidth;
    totalPriceEl.classList.add('animate');
    totalPriceEl.addEventListener('animationend', () => totalPriceEl.classList.remove('animate'), { once: true });
  }

  function updateProgress() {
    const pct = ((currentStep + 1) / steps.length) * 100;
    if (progressBar) progressBar.style.width = `${pct}%`;

    if (stepDotsContainer) {
      stepDotsContainer.innerHTML = '';
      steps.forEach((_, i) => {
        const dot = document.createElement('span');
        dot.className = 'calc-step-dot';
        if (i === currentStep) dot.classList.add('active');
        else if (i < currentStep) dot.classList.add('completed');
        stepDotsContainer.appendChild(dot);
      });
    }
  }

  function updateNavButtons() {
    if (btnBack) btnBack.style.display = currentStep > 0 ? 'block' : 'none';
    if (btnOffer) btnOffer.style.display = currentStep === steps.length - 1 ? 'inline-block' : 'none';
  }

  renderAllSteps();
  showStep(0);
  updatePrice();

  if (btnBack) {
    btnBack.addEventListener('click', () => {
      if (currentStep > 0) showStep(currentStep - 1);
    });
  }

  if (btnOffer) {
    btnOffer.addEventListener('click', () => {
      alert('Děkujeme za zájem! Budeme vás co nejdříve kontaktovat.');
    });
  }
})();
