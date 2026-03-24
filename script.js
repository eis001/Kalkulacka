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
      id: 'web-satisfaction',
      questions: [
        {
          id: 'web-satisfaction',
          text: 'Jak jste na tom aktuálně s webem?',
          options: [
            {
              label: 'Chci nový nebo výrazně lepší web',
              description: 'Potřebuji moderní řešení, které přivádí zákazníky.',
              value: 5000,
              priceLabel: '+5 000 Kč',
              variant: 'blue',
              priceStyle: 'pill'
            },
            {
              label: 'Chci využít vaše další služby (AI, grafika, správa)',
              description: 'Zajímá mě AI chatbot, grafika nebo správa webu.',
              value: 0,
              variant: 'default'
            }
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
            {
              label: 'Landing page',
              description: 'Jednostránkový web zaměřený na jasnou prezentaci a získávání klientů.',
              value: 0,
              variant: 'green'
            },
            {
              label: 'Rozsáhlejší web + 3 stránky',
              description: 'Více podstránek (např. služby, o nás, kontakt) pro lepší prezentaci a důvěryhodnost.',
              value: 3000,
              priceLabel: '+3 000 Kč',
              variant: 'blue',
              priceStyle: 'pill'
            }
          ]
        }
      ]
    },
    {
      id: 'brand-visual',
      questions: [
        {
          id: 'brand-visual',
          text: 'Máte už grafiku a logo pro váš web?',
          options: [
            {
              label: 'Chci grafiku na míru včetně loga',
              description: 'Vytvoříme vám kompletní vizuální styl – logo, barvy i grafiku pro web.',
              value: 4000,
              priceLabel: '+4 000 Kč',
              variant: 'blue',
              priceStyle: 'pill'
            },
            {
              label: 'Ano, grafiku už mám',
              description: 'Použijeme vaše podklady a přizpůsobíme je webu.',
              value: 0,
              variant: 'green'
            },
            {
              label: 'Grafiku teď neřeším',
              description: 'Zaměříme se jen na funkční web bez řešení vizuální identity.',
              value: 0,
              variant: 'red'
            }
          ]
        }
      ]
    },
    {
      id: 'ai-chatbot',
      questions: [
        {
          id: 'ai-chatbot',
          text: 'Chcete mít na webu chytrého asistenta, který komunikuje se zákazníky za vás?',
          options: [
            {
              label: 'Ano, chci AI chatbota (doporučeno)',
              description:
                'AI chatbot bude odpovídat na dotazy návštěvníků, pomůže jim s orientací na webu a nasměruje je k objednávce nebo kontaktu. Funguje 24/7 a šetří váš čas.',
              value: 2500,
              priceLabel: '+2 500 Kč',
              variant: 'blue',
              priceStyle: 'pill'
            },
            {
              label: 'Stačí mi klasický web',
              description: 'Bez automatické komunikace.',
              value: 0,
              variant: 'default'
            }
          ]
        }
      ]
    },
    {
      id: 'web-support',
      questions: [
        {
          id: 'web-support',
          text: 'Chcete mít web bez starostí i po spuštění?',
          options: [
            {
              label: 'Ano, chci správu a podporu (doporučeno)',
              description: 'Postaráme se o web, úpravy i případné problémy. Máte jistotu, že vše funguje.',
              value: 500,
              recurring: true,
              priceLabel: '500 Kč / měsíc',
              variant: 'blue',
              priceStyle: 'pill'
            },
            {
              label: 'Ne, budu si web spravovat sám',
              description: '',
              value: 0,
              variant: 'default'
            }
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
            ${opt.description ? `<span class="option-desc">${opt.description}</span>` : ''}
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
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify({
        name: name || '',
        email: email || '',
        phone: phone || '',
        company: company || '',
        note: note || '',
        price: finalPrice || '',
        answers: summaryAnswers || [],
        chatbot: answers.chatbot === true,
        support: answers.support === true
      })
    })
      .then(async (res) => {
        const text = await res.text();
        if (!res.ok) {
          throw new Error('HTTP ' + res.status);
        }
        return text ? JSON.parse(text) : { success: true };
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
    if (questionId === 'ai-chatbot') {
      answers.chatbot = optionIndex === 0;
    }
    if (questionId === 'web-support') {
      answers.support = optionIndex === 0;
    }
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
        const competitorSummaryEl = document.getElementById('price-competitor-summary-value');
        if (oneEl) oneEl.textContent = totals.oneTime.toLocaleString('cs-CZ') + ' Kč';
        if (competitorSummaryEl) {
          competitorSummaryEl.textContent =
            '≈ ' + (totals.oneTime * 4).toLocaleString('cs-CZ') + ' Kč';
        }
        if (monthEl) monthEl.textContent = totals.monthly > 0 ? totals.monthly.toLocaleString('cs-CZ') + ' Kč / měsíc' : '–';
      } else {
        const monthDefault = priceBoxDefault.querySelector('.price-default-monthly');
        const competitorEl = document.getElementById('price-competitor-value');
        if (totalPriceEl) totalPriceEl.textContent = totals.oneTime.toLocaleString('cs-CZ') + ' Kč';
        if (competitorEl) {
          const competitor = totals.oneTime * 4;
          competitorEl.textContent = '≈ ' + competitor.toLocaleString('cs-CZ') + ' Kč';
        }
        if (monthDefault) {
          monthDefault.textContent = totals.monthly > 0 ? totals.monthly.toLocaleString('cs-CZ') + ' Kč / měsíc' : '–';
        }
      }
    }

    const animateEl = isSummary
      ? priceBoxSummary?.querySelector('.price-one-time-value')
      : totalPriceEl;
    if (animateEl) {
      animateEl.classList.remove('animate');
      void animateEl.offsetWidth;
      animateEl.classList.add('animate');
      animateEl.addEventListener('animationend', () => animateEl.classList.remove('animate'), { once: true });
    }
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
