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
    },
    {
      id: 'social-media',
      questions: [
        {
          id: 'social-media',
          text: 'Jak zvládáte obsah na sociální sítě?',
          subtext: 'Aktivní komunikace na sítích pomáhá budovat důvěru a přivádět nové zákazníky.',
          options: [
            { label: 'Zvládám to sám/sama', description: 'Přidávám obsah pravidelně a mám to pod kontrolou.', value: 0, variant: 'green' },
            { label: 'Chci to nechat na někom jiném', description: 'Chci, aby se o obsah staral někdo za mě a fungovalo to dlouhodobě.', value: 5000, priceLabel: '+5 000 Kč / měsíc', variant: 'blue', priceStyle: 'pill', recurring: true },
            { label: 'Sítě teď neřeším', description: 'Není to pro mě aktuálně priorita.', value: 0, variant: 'red' }
          ]
        }
      ]
    },
    {
      id: 'graphics',
      questions: [
        {
          id: 'graphics',
          text: 'Potřebujete grafiku nebo vizuální materiály?',
          subtext: 'Vizuály dělají první dojem – od bannerů až po obsah na sítě.',
          options: [
            { label: 'Mám vlastní materiály', description: 'Grafiku si řeším sám/sama nebo ji už mám hotovou.', value: 0, variant: 'green' },
            { label: 'Chci vytvořit grafiku pomocí AI', description: 'Navrhneme moderní vizuály (např. bannery, posty, jednoduché grafiky) rychle a efektivně.', value: 4000, priceLabel: '+4 000 Kč', variant: 'blue', priceStyle: 'pill' }
          ]
        }
      ]
    },
    { id: 'summary', type: 'summary' }
  ];

  let currentStep = 0;
  const answers = {};

  function renderStepContent(stepIndex) {
    const step = steps[stepIndex];
    const stepEl = document.createElement('div');
    stepEl.className = `calc-step-content${step.type === 'summary' ? ' calc-step-summary' : ''} ${stepIndex === currentStep ? 'active' : ''}`;
    stepEl.dataset.stepIndex = stepIndex;

    if (step.type === 'summary') {
      stepEl.innerHTML = renderSummaryHTML();
      stepEl.querySelector('#summary-form')?.addEventListener('submit', handleFormSubmit);
      stepEl.querySelector('.btn-edit-answers')?.addEventListener('click', () => showStep(steps.length - 2));
      stepEl.querySelector('.btn-restart')?.addEventListener('click', handleRestart);
      return stepEl;
    }

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

  function getSummaryRows() {
    const rows = [];
    steps.forEach((step) => {
      if (step.type === 'summary') return;
      step.questions?.forEach((q) => {
        const a = answers[q.id];
        if (a && a.optionIndex !== undefined && q.options[a.optionIndex]) {
          rows.push({ question: q.text, answer: q.options[a.optionIndex].label });
        }
      });
    });
    return rows;
  }

  function renderSummaryHTML() {
    const rows = getSummaryRows();
    const rowsHtml = rows.map((r) =>
      `<div class="summary-row"><span class="summary-question">${r.question}</span><span class="summary-answer">${r.answer}</span></div>`
    ).join('');

    return `
      <div class="summary-header">
        <div class="summary-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h3 class="summary-title">Hotovo. Tady je váš přehled.</h3>
        <p class="summary-subtext">Na základě vašich odpovědí jsme připravili orientační přehled. Vyplňte kontakt a ozveme se vám.</p>
      </div>
      <div class="summary-answers">${rowsHtml}</div>
      <div class="summary-form-section">
        <h4 class="summary-form-title">Odešlete poptávku</h4>
        <form id="summary-form" class="summary-form">
          <div class="form-group">
            <label for="form-jmeno">Jméno a příjmení <span class="required">*</span></label>
            <input type="text" id="form-jmeno" name="jmeno" required placeholder="Jan Novák">
          </div>
          <div class="form-group">
            <label for="form-email">E-mail <span class="required">*</span></label>
            <input type="email" id="form-email" name="email" required placeholder="jan@firma.cz">
          </div>
          <div class="form-group">
            <label for="form-telefon">Telefon</label>
            <input type="tel" id="form-telefon" name="telefon" placeholder="+420 123 456 789">
          </div>
          <div class="form-group">
            <label for="form-firma">Firma / značka</label>
            <input type="text" id="form-firma" name="firma" placeholder="Moje firma s.r.o.">
          </div>
          <div class="form-group">
            <label for="form-poznamka">Poznámka</label>
            <textarea id="form-poznamka" name="poznamka" rows="3" placeholder="Máte nějaké speciální požadavky?"></textarea>
          </div>
          <div class="summary-form-actions">
            <button type="submit" class="btn-offer btn-submit">Odeslat poptávku</button>
            <button type="button" class="calc-btn-nav btn-edit-answers">Upravit odpovědi</button>
            <button type="button" class="btn-text btn-restart">Začít znovu</button>
          </div>
        </form>
      </div>
    `;
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('.btn-submit');
    const formSection = form.closest('.summary-form-section');
    const errorEl = form.querySelector('.form-error');

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Odesílám…';
    }
    if (errorEl) errorEl.remove();

    const totals = calculateTotal();
    const finalPrice = totals.monthly > 0
      ? totals.oneTime.toLocaleString('cs-CZ') + ' Kč jednorázově + ' + totals.monthly.toLocaleString('cs-CZ') + ' Kč / měsíc'
      : totals.oneTime.toLocaleString('cs-CZ') + ' Kč';

    const name = form.querySelector('[name="jmeno"]')?.value?.trim() || '';
    const email = form.querySelector('[name="email"]')?.value?.trim() || '';
    const phone = form.querySelector('[name="telefon"]')?.value?.trim() || '';
    const company = form.querySelector('[name="firma"]')?.value?.trim() || '';
    const note = form.querySelector('[name="poznamka"]')?.value?.trim() || '';
    const summaryAnswers = getSummaryRows().map((r) => ({ question: r.question, answer: r.answer }));

    fetch('https://script.google.com/macros/s/AKfycbyB_iTiqeNs3JvIRTrQbVR-arMJPyAFTXOaic4zQhGqkeyfq4HlaZ9AqkazqUoRak1F/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name,
        email: email,
        phone: phone,
        company: company,
        note: note,
        price: finalPrice,
        answers: summaryAnswers
      })
    })
      .then((res) => {
        if (!res.ok) throw new Error('Request failed');
        const ct = res.headers.get('content-type');
        if (ct && ct.includes('application/json')) return res.json();
        return {};
      })
      .then(() => {
        const success = document.createElement('div');
        success.className = 'summary-success';
        success.innerHTML = '<p class="summary-success-text">Děkujeme, ozveme se vám co nejdříve.</p>';
        formSection.replaceWith(success);
      })
      .catch(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Odeslat poptávku';
        }
        const errDiv = document.createElement('p');
        errDiv.className = 'form-error';
        errDiv.textContent = 'Odeslání se nepovedlo, zkuste to prosím znovu.';
        form.insertBefore(errDiv, form.querySelector('.summary-form-actions'));
      });
  }

  function handleRestart() {
    Object.keys(answers).forEach((k) => delete answers[k]);
    renderAllSteps();
    showStep(0);
    updatePrice();
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
    const step = steps[index];
    if (step && step.questions) restoreSelections(step);
    const card = document.querySelector('.calculator-card');
    if (card) card.classList.toggle('calc-card-summary', step?.type === 'summary');
    updateProgress();
    updateNavButtons();
    updatePrice();
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
    let oneTime = 0;
    let monthly = 0;
    steps.forEach((step) => {
      if (step.type === 'summary') return;
      step.questions?.forEach((q) => {
        const a = answers[q.id];
        if (!a || a.optionIndex === undefined) return;
        const opt = q.options[a.optionIndex];
        if (!opt) return;
        if (opt.recurring) monthly += opt.value || 0;
        else oneTime += opt.value || 0;
      });
    });
    return { oneTime, monthly };
  }

  function updatePrice() {
    const totals = calculateTotal();
    const isSummary = steps[currentStep]?.type === 'summary';

    const priceBoxDefault = document.getElementById('price-box-default');
    const priceBoxSummary = document.getElementById('price-box-summary');
    if (priceBoxDefault && priceBoxSummary) {
      priceBoxDefault.style.display = isSummary ? 'none' : 'block';
      priceBoxSummary.style.display = isSummary ? 'block' : 'none';
      if (isSummary) {
        const oneEl = priceBoxSummary.querySelector('.price-one-time-value');
        const monthEl = priceBoxSummary.querySelector('.price-monthly-value');
        if (oneEl) oneEl.textContent = totals.oneTime.toLocaleString('cs-CZ') + ' Kč';
        if (monthEl) monthEl.textContent = totals.monthly > 0 ? totals.monthly.toLocaleString('cs-CZ') + ' Kč / měsíc' : '–';
      }
    }

    const totalForDisplay = totals.oneTime + totals.monthly;
    totalPriceEl.textContent = `${totalForDisplay.toLocaleString('cs-CZ')} Kč`;
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
    const isSummary = steps[currentStep]?.type === 'summary';
    if (btnBack) btnBack.style.display = currentStep > 0 ? 'block' : 'none';
    const footer = document.getElementById('calc-footer');
    if (footer) footer.style.display = isSummary ? 'none' : 'block';
  }

  renderAllSteps();
  showStep(0);
  updatePrice();

  if (btnBack) {
    btnBack.addEventListener('click', () => {
      if (currentStep > 0) showStep(currentStep - 1);
    });
  }
})();
