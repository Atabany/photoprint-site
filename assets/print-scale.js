(() => {
  const form = document.getElementById('scale-form');
  if (!form) return;
  const result = document.getElementById('scale-result');
  const expected = document.getElementById('scale-expected');
  const measured = document.getElementById('scale-measured');
  const format = value => new Intl.NumberFormat('en', {maximumFractionDigits: 2}).format(value);
  const clearResult = () => {
    result.textContent = 'Enter positive lengths in the same unit, then choose Check scale.';
  };
  form.addEventListener('input', clearResult);
  form.addEventListener('invalid', clearResult, true);
  form.addEventListener('submit', event => {
    event.preventDefault();
    const label = Number(expected.value);
    const length = Number(measured.value);
    const scale = length / label * 100;
    if (!form.reportValidity() || ![label, length, scale].every(n => Number.isFinite(n) && n > 0)) {
      clearResult();
      return;
    }
    const difference = scale - 100;
    const measurement = difference === 0
      ? 'The measured length matches its label. Check the other ruler and the square too; this is not a precision guarantee.'
      : `${format(Math.abs(difference))}% ${difference < 0 ? 'smaller' : 'larger'} than labelled. Check matching paper size, Actual size / 100%, and borderless expansion, then print another test sheet.`;
    result.textContent = `${format(scale)}% scale. ${measurement}`;
  });
})();
