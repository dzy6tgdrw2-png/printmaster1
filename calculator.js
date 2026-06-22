// Calculator logic for Print-Master
document.addEventListener('DOMContentLoaded', function() {
    const calculateBtn = document.getElementById('calculateBtn');
    const gotoContactBtn = document.getElementById('gotoContactBtn');
    const resultDiv = document.getElementById('result');

    // Function to show calculate button
    function showCalculateBtn() {
        calculateBtn.style.display = 'block';
        gotoContactBtn.style.display = 'none';
        resultDiv.textContent = '';
    }

    // Initially show calculate button
    showCalculateBtn();

    // Add generic listeners to inputs/selects to show button on change/input
    document.querySelectorAll('#priceCalculator input, #priceCalculator select').forEach(el => {
        el.addEventListener('change', showCalculateBtn);
        el.addEventListener('input', showCalculateBtn);
    });

    // Add listeners for checkbox buttons styling (will work whether checkboxes are enabled or disabled)
    document.querySelectorAll('.checkbox-group input[type="checkbox"]').forEach(checkbox => {
        const label = checkbox.parentElement;
        checkbox.addEventListener('change', function() {
            label.classList.toggle('checked', this.checked);
        });
        label.classList.toggle('checked', checkbox.checked);
    });

    // Pricing rates (in rubles) per category
    const rates = {
        business: { base: 5, foil: 2, uv: 3, lamination: 1, cutting: 1.5, urgent: 5 }, // Визитки
        leaflet: { base: 6, foil: 0, uv: 2, lamination: 1, cutting: 1, urgent: 6 }, // Листовки
        brochure: { base: 9, foil: 3, uv: 4, lamination: 2, cutting: 2.5, urgent: 9 }, // Буклеты
        catalog: { base: 12, foil: 4, uv: 5, lamination: 3, cutting: 3.5, urgent: 12 }, // Каталоги
        calendar: { base: 14, foil: 3, uv: 5, lamination: 3, cutting: 2.5, urgent: 10 },
        packaging: { base: 20, foil: 6, uv: 8, lamination: 5, cutting: 6, urgent: 15 },
        poster: { base: 18, foil: 0, uv: 6, lamination: 4, cutting: 0, urgent: 14 },
        stickers: { base: 4, foil: 0, uv: 0, lamination: 1.5, cutting: 1.5, urgent: 6 },
        flyer: { base: 6, foil: 0, uv: 2, lamination: 1, cutting: 1, urgent: 6 },
        booklet: { base: 11, foil: 3, uv: 4, lamination: 2.5, cutting: 3, urgent: 11 },
        postcard: { base: 7, foil: 2, uv: 3, lamination: 2, cutting: 0.5, urgent: 8 },
        certificate: { base: 10, foil: 3, uv: 3, lamination: 2.5, cutting: 1, urgent: 9 },
        forms: { base: 5, foil: 0, uv: 0, lamination: 0, cutting: 0, urgent: 5 },
        envelope: { base: 6, foil: 0, uv: 0, lamination: 0, cutting: 0.5, urgent: 6 },
        folder: { base: 12, foil: 4, uv: 3, lamination: 3, cutting: 2, urgent: 12 },
        banner: { base: 30, foil: 0, uv: 0, lamination: 0, cutting: 10, urgent: 25 }
    };

    // Format multipliers for common sizes
    const formatMultipliers = {
        '90x50': 1,
        '105x148': 1.05, // A6
        '148x210': 1.2,  // A5
        '210x297': 1.5,  // A4
        '297x420': 2.0,  // A3
        '420x594': 2.5,  // A2
        '594x841': 3.2,  // A1
        '841x1189': 4.0, // A0
        'custom': 2
    };

    // Paper multipliers
    const paperMultipliers = {
        'standard': 1,
        'glossy': 1.1,
        'matte': 1.05,
        'designer': 1.2
    };

    // Color multipliers
    const colorMultipliers = {
        'bw': 1,
        'color': 1.5
    };

    // Product definitions: available formats, whether pages are applicable, allowed papers and extras
    const products = {
        business: { label: 'Визитки', formats: ['90x50'], pages: false, papers: ['standard','glossy','matte','designer'], extras: { foil: true, uv: true, lamination: true, cutting: true } },
        leaflet: { label: 'Листовки', formats: ['105x148','148x210','210x297','custom'], pages: false, papers: ['standard','glossy','matte'], extras: { foil: false, uv: true, lamination: true, cutting: false } },
        brochure: { label: 'Буклеты', formats: ['148x210','210x297'], pages: true, papers: ['standard','glossy','matte','designer'], extras: { foil: true, uv: true, lamination: true, cutting: true } },
        catalog: { label: 'Каталоги', formats: ['210x297','297x420'], pages: true, papers: ['standard','glossy','matte','designer'], extras: { foil: true, uv: true, lamination: true, cutting: true } },
        calendar: { label: 'Календари', formats: ['210x297','297x420','custom'], pages: false, papers: ['glossy','matte','designer'], extras: { foil: false, uv: true, lamination: true, cutting: false } },
        packaging: { label: 'Упаковка', formats: ['custom'], pages: false, papers: ['designer','standard'], extras: { foil: true, uv: true, lamination: false, cutting: true } },
        poster: { label: 'Плакаты', formats: ['420x594','594x841','841x1189','custom'], pages: false, papers: ['standard','glossy'], extras: { foil: false, uv: true, lamination: true, cutting: false } },
        stickers: { label: 'Наклейки', formats: ['custom'], pages: false, papers: ['standard'], extras: { foil: false, uv: false, lamination: true, cutting: true } },
        flyer: { label: 'Флаеры', formats: ['105x148','148x210','210x297'], pages: false, papers: ['standard','glossy'], extras: { foil: false, uv: true, lamination: true, cutting: false } },
        booklet: { label: 'Брошюры', formats: ['148x210','210x297'], pages: true, papers: ['standard','glossy','matte','designer'], extras: { foil: true, uv: true, lamination: true, cutting: true } },
        postcard: { label: 'Открытки', formats: ['90x50','105x148','148x210'], pages: false, papers: ['standard','glossy','designer'], extras: { foil: true, uv: true, lamination: true, cutting: true } },
        certificate: { label: 'Сертификаты', formats: ['210x297','148x210'], pages: false, papers: ['designer','glossy'], extras: { foil: true, uv: true, lamination: true, cutting: true } },
        forms: { label: 'Бланки', formats: ['210x297'], pages: false, papers: ['standard'], extras: { foil: false, uv: false, lamination: false, cutting: false } },
        envelope: { label: 'Конверты', formats: ['custom'], pages: false, papers: ['standard','designer'], extras: { foil: false, uv: false, lamination: false, cutting: true } },
        folder: { label: 'Папки', formats: ['210x297','297x420'], pages: false, papers: ['designer','standard'], extras: { foil: true, uv: true, lamination: true, cutting: true } },
        banner: { label: 'Баннеры', formats: ['custom'], pages: false, papers: ['standard'], extras: { foil: false, uv: false, lamination: false, cutting: true } }
    };

    // Helper to populate category select from products
    const categorySelect = document.getElementById('category');
    function populateCategories() {
        categorySelect.innerHTML = '<option value="">Выберите...</option>' + Object.keys(products).map(k => `<option value="${k}">${products[k].label}</option>`).join('');
    }
    populateCategories();

    // Helper to update UI controls based on selected product
    function updateParamsForCategory(catKey) {
        const formatSelect = document.getElementById('format');
        const paperSelect = document.getElementById('paper');
        const pagesGroup = document.getElementById('pages') ? document.getElementById('pages').closest('.form-group') : null;

        if (!catKey || !products[catKey]) {
            // reset to defaults
            if (pagesGroup) pagesGroup.style.display = '';
            Array.from(paperSelect.options).forEach(o => o.disabled = false);
            document.querySelectorAll('.checkbox-group input[type="checkbox"]').forEach(cb => cb.disabled = false);
            return;
        }

        const def = products[catKey];

        // Populate formats
        formatSelect.innerHTML = '<option value="">Выберите...</option>' + def.formats.map(f => `<option value="${f}">${formatLabel(f)}</option>`).join('');

        // Populate paper options (disable others)
        const allowedPapers = new Set(def.papers);
        paperSelect.innerHTML = Object.keys(paperMultipliers).map(p => `<option value="${p}" ${allowedPapers.has(p) ? '' : 'disabled'}>${paperLabel(p)}</option>`).join('');

        // Show/hide pages
        if (pagesGroup) pagesGroup.style.display = def.pages ? '' : 'none';
        if (!def.pages) {
            document.getElementById('pages').value = 1;
        }

        // Enable/disable extras
        ['foil','uv','lamination','cutting'].forEach(extra => {
            const cb = document.getElementById(extra);
            if (!cb) return;
            cb.disabled = !def.extras[extra];
            if (cb.disabled) {
                cb.checked = false;
                cb.parentElement.classList.remove('checked');
            }
        });
    }

    function formatLabel(code) {
        if (code === 'custom') return 'Другой';
        return code.replace('x','×') + ' мм';
    }

    function paperLabel(key) {
        switch(key) {
            case 'standard': return 'Обычная';
            case 'glossy': return 'Глянцевая (+10%)';
            case 'matte': return 'Матовая (+5%)';
            case 'designer': return 'Дизайнерская (+20%)';
            default: return key;
        }
    }

    // Wire category change to update parameters
    categorySelect.addEventListener('change', function() {
        updateParamsForCategory(this.value);
    });

    // Initialize UI based on default (empty)
    updateParamsForCategory(categorySelect.value);

    calculateBtn.addEventListener('click', function() {
        const category = document.getElementById('category').value;
        const format = document.getElementById('format').value;
        const paper = document.getElementById('paper').value;
        const color = document.getElementById('color').value;
        const pages = parseInt(document.getElementById('pages').value) || 1;
        const quantity = parseInt(document.getElementById('quantity').value) || 100;
        const foil = document.getElementById('foil').checked;
        const uv = document.getElementById('uv').checked;
        const lamination = document.getElementById('lamination').checked;
        const cutting = document.getElementById('cutting').checked;
        const urgent = document.getElementById('urgent').checked;

        if (!category) {
            resultDiv.textContent = 'Пожалуйста, выберите категорию продукции.';
            return;
        }
        if (!format) {
            resultDiv.textContent = 'Пожалуйста, выберите формат.';
            return;
        }

        let total = 0;

        // Base price per unit (fall back to generic if not defined)
        const rate = rates[category] || { base: 10, foil: 2, uv: 3, lamination: 1, cutting: 1.5, urgent: 5 };
        let basePrice = rate.base;

        // Apply multipliers (use mapping or fallback)
        const fmtMul = formatMultipliers[format] || (format === 'custom' ? formatMultipliers['custom'] : 1.5);
        basePrice *= fmtMul;
        basePrice *= (paperMultipliers[paper] || 1);
        basePrice *= (colorMultipliers[color] || 1);

        // Multiply by pages if product supports pages
        const prodDef = products[category];
        const effectivePages = (prodDef && prodDef.pages) ? pages : 1;
        basePrice *= effectivePages;

        // Total for quantity
        total = basePrice * quantity;

        // Add extras only when allowed for product
        if (foil && prodDef && prodDef.extras.foil) {
            total += (rate.foil || 0) * quantity;
        }
        if (uv && prodDef && prodDef.extras.uv) {
            total += (rate.uv || 0) * quantity;
        }
        if (lamination && prodDef && prodDef.extras.lamination) {
            total += (rate.lamination || 0) * quantity;
        }
        if (cutting && prodDef && prodDef.extras.cutting) {
            total += (rate.cutting || 0) * quantity;
        }
        if (urgent) {
            total += (rate.urgent || 0) * quantity;
        }

        // Display result
        resultDiv.textContent = `Общая стоимость: ${total.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} руб.`;

        // Hide calculate button and show contact button
        calculateBtn.style.display = 'none';
        gotoContactBtn.style.display = 'block';
    });

    gotoContactBtn.addEventListener('click', function() {
        document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
    });
});