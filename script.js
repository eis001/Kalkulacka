/**
 * EH STUDIO — Kalkulačka ceny webu
 * Čisté JavaScript, žádné závislosti
 */

(function () {
  const questionsContainer = document.getElementById('calculator-questions');
  const totalPriceEl = document.getElementById('total-price');
  const btnOffer = document.getElementById('btn-offer');

  if (!questionsContainer || !totalPriceEl) return;

  const questions = [
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
  ];

  const answers = {};

  function renderQuestions() {
    questionsContainer.innerHTML = '';
    questions.forEach((q) => {
      const box = document.createElement('div');
      box.className = 'question-box';
      const subtextHtml = q.subtext ? `<p class="question-subtext">${q.subtext}</p>` : '';
      box.innerHTML = `<h3>${q.text}</h3>${subtextHtml}<div class="answer-options" data-question-id="${q.id}"></div>`;

      const optionsContainer = box.querySelector('.answer-options');
      q.options.forEach((opt) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `answer-option answer-variant-${opt.variant || 'default'}`;
        btn.dataset.value = opt.value;
        const priceBadge = opt.priceLabel ? `<span class="option-price option-price-highlight">${opt.priceLabel}</span>` : '';
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
        btn.addEventListener('click', () => selectAnswer(q.id, opt.value, optionsContainer, btn));
        optionsContainer.appendChild(btn);
      });

      questionsContainer.appendChild(box);
    });
  }

  function selectAnswer(questionId, value, optionsContainer, selectedBtn) {
    answers[questionId] = value;
    optionsContainer.querySelectorAll('.answer-option').forEach((btn) => btn.classList.remove('selected'));
    selectedBtn.classList.add('selected');
    updatePrice();
  }

  function calculateTotal() {
    return Object.values(answers).reduce((sum, val) => sum + (val || 0), 0);
  }

  function updatePrice() {
    const total = calculateTotal();
    totalPriceEl.textContent = `${total.toLocaleString('cs-CZ')} Kč`;
    totalPriceEl.classList.remove('animate');
    void totalPriceEl.offsetWidth;
    totalPriceEl.classList.add('animate');
    totalPriceEl.addEventListener('animationend', () => totalPriceEl.classList.remove('animate'), { once: true });
  }

  if (btnOffer) {
    btnOffer.addEventListener('click', () => {
      alert('Děkujeme za zájem! Budeme vás co nejdříve kontaktovat.');
    });
  }

  renderQuestions();
  updatePrice();
})();
