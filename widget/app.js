const widgetUI = {
    downPaymentChoose: null,
    includeTaxes: false,
    uiElements: {
        mdcElement: {
            homeValueInput: null,
            amountInput: null,
            percentageInput: null,
            annualInterestRateInput: null,
            loanTermInput: null,
            propertyTaxRateInput: null,
        },
        downPaymentRadioButtons: document.getElementsByName('downPayment'),
        propertyTaxSwitch: document.getElementById('propertyTaxSwitch'),
        propertyTaxContainer: document.getElementById('propertyTaxContainer'),
        mortgageCalculatorForm: document.getElementById(
            'mortgageCalculatorForm'
        ),
        monthlyPayment: document.getElementById('monthlyPayment'),
        resultContainer: document.getElementById('resultContainer'),
        amountInputGroup: document.getElementById('amountInputGroup'),
        percentageInputGroup: document.getElementById('percentageInputGroup'),
        introduction: document.getElementById('introduction'),
    },
    _errMessages: {
        inputRequiredMessage: null,
        inputMinimumMessage: null,
        inputNotValidMessage: null,
        inputMaximumMessage: null,
        amountMoreThanHomeValueMessage: null,
    },

    init() {
        buildfire.appearance.titlebar.isVisible(null, (err, isVisible) => {
            if (err) {
                console.error(err);
                return;
            }
            if (!isVisible) {
                document.body.classList.add('invisible-titlebar-safe-area');
            }
        });

        this._setIntroduction();
        this._getErrorMessagesStr();
        this._initMDCComponents();
        this._radioButtonsToggle();
        this._switchButtonsToggle();
        this._onSubmit();

        buildfire.messaging.onReceivedMessage =
            this.handleReceivedMessage.bind(this);

        document.addEventListener(
            'invalid',
            this.handleInvalidInput.bind(this),
            true
        );
    },

    handleReceivedMessage(message) {
        if (message.scope === 'introduction') {
            this.uiElements.introduction.innerHTML = message.introduction;
        }
    },

    handleInvalidInput(e) {
        e.preventDefault();
        let firstInvalidElement = null;

        for (const key in this.uiElements.mdcElement) {
            if (this.uiElements.mdcElement.hasOwnProperty(key)) {
                const element = this.uiElements.mdcElement[key];
                if (element) {
                    if (!element.valid && !firstInvalidElement) {
                        firstInvalidElement = element;
                    }
                    element.input_.focus();
                    this._validationsHandler(element, false);
                    if(element.input_.id === 'propertyTaxRate' && this.includeTaxes){
                        let prefixElement = element.input_.previousElementSibling;
                        prefixElement.classList.remove('hidden');
                        document
                        .getElementById('propertyTaxContainer')
                        .classList.add('not-valid-input');
                            element.helperText_.root_.classList.remove('hidden');
                    }
                }
            }
        }

        if (firstInvalidElement) {
            firstInvalidElement.input_.focus();
        }
    },

    _setIntroduction() {
        ContentRepository.get().then((res) => {
            this.uiElements.introduction.innerHTML = res.introduction;
        });
    },

    _initMDCComponents() {
        this.uiElements.mdcElement.homeValueInput =
            new mdc.textField.MDCTextField(
                document.querySelector('.home-value')
            );
        this.uiElements.mdcElement.amountInput = new mdc.textField.MDCTextField(
            document.querySelector('.amount')
        );
        this.uiElements.mdcElement.percentageInput =
            new mdc.textField.MDCTextField(
                document.querySelector('.percentage')
            );
        this.uiElements.mdcElement.annualInterestRateInput =
            new mdc.textField.MDCTextField(
                document.querySelector('.annual-interest-rate')
            );
        this.uiElements.mdcElement.loanTermInput =
            new mdc.textField.MDCTextField(
                document.querySelector('.loan-term')
            );
        this.uiElements.mdcElement.propertyTaxRateInput =
            new mdc.textField.MDCTextField(
                document.querySelector('.property-tax-rate')
            );
        this.uiElements.mdcElement.homeValueInput.input_.addEventListener(
            'keyup',
            () => {
                this.uiElements.mdcElement.amountInput.input_.setAttribute(
                    'max',
                    this.uiElements.mdcElement.homeValueInput.value
                );
                this._validationsHandler(
                    this.uiElements.mdcElement.amountInput,
                    true
                );
            }
        );
        this._ErrMsgToggle();
    },

    _radioButtonsToggle() {
        this.uiElements.downPaymentRadioButtons.forEach((radio) => {
            radio.addEventListener('change', (e) => {
                this.downPaymentChoose = e.target.value;
                if (this.downPaymentChoose === 'percentage') {
                    let prefixElement =
                        this.uiElements.mdcElement.percentageInput.input_
                            .previousElementSibling;
                    this.uiElements.amountInputGroup.classList.add('hidden');
                    this.uiElements.mdcElement.amountInput.input_.required = false;
                    this.uiElements.percentageInputGroup.classList.remove(
                        'hidden'
                    );
                    this.uiElements.mdcElement.percentageInput.input_.required = true;
                    this.uiElements.mdcElement.percentageInput.helperText_.root_.classList.add(
                        'hidden'
                    );
                    if (
                        this.uiElements.mdcElement.amountInput.value.trim() !==
                            '' &&
                        this.uiElements.mdcElement.homeValueInput.value.trim() !==
                            ''
                    ) {
                        let percentageValue = parseFloat(
                            (
                                (Number(
                                    this.uiElements.mdcElement.amountInput.value
                                ) /
                                    Number(
                                        this.uiElements.mdcElement
                                            .homeValueInput.value
                                    )) *
                                100
                            ).toFixed(1)
                        );
                        this.uiElements.mdcElement.percentageInput.value =
                            percentageValue;

                        this.uiElements.mdcElement.percentageInput.helperText_.root_.classList.remove(
                            'hidden'
                        );
                        prefixElement.classList.remove('hidden');
                        this.uiElements.mdcElement.percentageInput.helperText_.root_.classList.add(
                            'hidden'
                        );
                    }
                    this._validationsHandler(
                        this.uiElements.mdcElement.percentageInput,
                        true
                    );
                    this._inputStyle(
                        prefixElement,
                        this.uiElements.mdcElement.percentageInput.input_
                    );
                } else {
                    let prefixElement =
                        this.uiElements.mdcElement.amountInput.input_
                            .previousElementSibling;

                    this.uiElements.percentageInputGroup.classList.add(
                        'hidden'
                    );
                    this.uiElements.mdcElement.percentageInput.input_.required = false;
                    this.uiElements.amountInputGroup.classList.remove('hidden');
                    this.uiElements.mdcElement.amountInput.input_.required = true;
                    this.uiElements.mdcElement.amountInput.helperText_.root_.classList.add(
                        'hidden'
                    );
                    if (
                        this.uiElements.mdcElement.percentageInput.value.trim() !==
                            '' &&
                        this.uiElements.mdcElement.homeValueInput.value.trim() !==
                            ''
                    ) {
                        let amountValue = parseFloat(
                            (
                                (Number(
                                    this.uiElements.mdcElement.percentageInput
                                        .value
                                ) /
                                    100) *
                                Number(
                                    this.uiElements.mdcElement.homeValueInput
                                        .value
                                )
                            ).toFixed(1)
                        );

                        if (amountValue) {
                            this.uiElements.mdcElement.amountInput.value =
                                amountValue;
                        }

                        this.uiElements.mdcElement.percentageInput.helperText_.root_.classList.remove(
                            'hidden'
                        );
                        prefixElement.classList.remove('hidden');
                        this.uiElements.mdcElement.amountInput.helperText_.root_.classList.add(
                            'hidden'
                        );
                        this._validationsHandler(
                            this.uiElements.mdcElement.amountInput,
                            true
                        );
                    }
                    this._inputStyle(
                        prefixElement,
                        this.uiElements.mdcElement.amountInput.input_
                    );
                }
            });
        });
    },

    _validationsHandler(element, tracking) {
        if (element.valid) {
            element.helperText_.root_.classList.add('hidden');
            if (element.value.trim() === '') {
                let prefixElement = element.input_.previousElementSibling;
                prefixElement.classList.add('hidden');
            }
            if (element.input_.id === 'amount' && element.value.trim() !== '') {
                document
                    .getElementById('amountInputGroup')
                    .classList.remove('not-valid-input');
            }
            if (
                element.input_.id === 'percentage' &&
                element.value.trim() !== ''
            ) {
                document
                    .getElementById('percentageInputGroup')
                    .classList.remove('not-valid-input');
            }
            if (
                element.input_.id === 'propertyTaxRate' &&
                element.value.trim() !== ''
            ) {
                document
                    .getElementById('propertyTaxContainer')
                    .classList.remove('not-valid-input');
            }
            return;
        }

        if (element.input_.id === 'homeValue') {
            if (
                element.value.trim() !== '' &&
                element.min.trim() !== '' &&
                Number(element.value) < 10000
            ) {
                element.helperText_.foundation_.adapter_.setContent(
                    this._errMessages.inputMinimumMessage
                );
            } else {
                element.helperText_.foundation_.adapter_.setContent(
                    this._errMessages.inputRequiredMessage
                );
            }
        } else if (
            element.input_.id === 'loanTerm' &&
            (element.value === '0' || Number(element.value) > 100)
        ) {
            element.helperText_.foundation_.adapter_.setContent(
                this._errMessages.inputMaximumMessage
            );
        } else if (
            (element.input_.id === 'percentage' ||
                element.input_.id === 'annualInterestRate' ||
                element.input_.id === 'propertyTaxRate') &&
            Number(element.value) > 100
        ) {
            if (element.input_.id === 'percentage' && tracking) {
                document
                    .getElementById('percentageInputGroup')
                    .classList.add('not-valid-input');
                element.helperText_.root_.classList.remove('hidden');
            }
            element.helperText_.foundation_.adapter_.setContent(
                this._errMessages.inputMaximumMessage
            );
        } else if (element.input_.id === 'amount') {
            if (
                Number(element.value) >
                    Number(this.uiElements.mdcElement.homeValueInput.value) &&
                element.value.trim() !== ''
            ) {
                element.helperText_.root_.classList.remove('hidden');
                element.helperText_.foundation_.adapter_.setContent(
                    this._errMessages.amountMoreThanHomeValueMessage
                );
                document
                    .getElementById('amountInputGroup')
                    .classList.add('not-valid-input');
            } else {
                if (!tracking) {
                    document
                        .getElementById('amountInputGroup')
                        .classList.remove('not-valid-input');
                    element.helperText_.foundation_.adapter_.setContent(
                        this._errMessages.inputRequiredMessage
                    );
                } else if (
                    !element.helperText_.root_.classList.contains('hidden')
                ) {
                    document
                        .getElementById('amountInputGroup')
                        .classList.add('not-valid-input');
                }
            }
        } else {
            if (
                element.value.trim() !== '' &&
                element.min.trim() !== '' &&
                Number(element.value) <= 0
                ) {
                element.helperText_.foundation_.adapter_.setContent(
                    this._errMessages.inputNotValidMessage
                );
            } else if (element.input_.validity.badInput) {
                element.helperText_.foundation_.adapter_.setContent(
                    this._errMessages.inputNotValidMessage
                );
            }else {
                element.helperText_.foundation_.adapter_.setContent(
                    this._errMessages.inputRequiredMessage
                );
            }
        }
        if (!tracking) {
            element.helperText_.root_.classList.remove('hidden');
        }
        if (element.value.trim() === '') {
            let prefixElement = element.input_.previousElementSibling;
            prefixElement.classList.add('hidden');
        }
    },

    _ErrMsgToggle() {
        const { mdcElement, resultContainer } = this.uiElements;

        for (const key in mdcElement) {
            if (mdcElement.hasOwnProperty(key)) {
                const element = mdcElement[key];

                if (element) {
                    element.input_.addEventListener('keyup', () => {
                        resultContainer.classList.add('hidden');
                    });

                    element.input_.addEventListener('focusout', () => {
                        this._validationsHandler(element, false);
                    });

                    element.input_.onfocus = (e) => {
                        const prefixElement =
                            element.input_.previousElementSibling;
                        prefixElement.classList.remove('hidden');
                        this._inputStyle(prefixElement, element.input_);
                    };
                }
            }
        }
    },

    _inputStyle(prefixElement, element) {
        if (element.id === 'loanTerm') return;
        var rect = prefixElement.getBoundingClientRect();
        var width = rect.width;
        element.style.paddingLeft = width + 20 + 'px';
    },

    _switchButtonsToggle() {
        const { propertyTaxSwitch, mdcElement, propertyTaxContainer } =
            this.uiElements;

        propertyTaxSwitch.addEventListener('change', (e) => {
            this.uiElements.resultContainer.classList.add('hidden');
            const { propertyTaxRateInput } = mdcElement;
            const { value, helperText_, root_ } = propertyTaxRateInput;

            if (e.target.checked) {
                this.includeTaxes = true;
                propertyTaxRateInput.input_.required = true;
                propertyTaxContainer.classList.remove('hidden');
            } else {
                this.includeTaxes = false;
                propertyTaxRateInput.input_.required = false;
                propertyTaxContainer.classList.add('hidden');

                if (value.trim() === '') {
                    helperText_.root_.classList.add('hidden');
                    document
                        .getElementById('propertyTaxContainer')
                        .classList.remove('not-valid-input');
                } else if (Number(value.trim()) >= 100) {
                    document
                        .getElementById('propertyTaxContainer')
                        .classList.add('not-valid-input');
                }
            }
        });
    },

    _onSubmit() {
        this.uiElements.mortgageCalculatorForm.addEventListener(
            'submit',
            (e) => {
                e.preventDefault();

                const homeValue = parseFloat(
                    this.uiElements.mdcElement.homeValueInput.value
                );
                const interestRate =
                    parseFloat(
                        this.uiElements.mdcElement.annualInterestRateInput.value
                    ) / 100;
                const loanTerm = parseFloat(
                    this.uiElements.mdcElement.loanTermInput.value
                );
                const downPayment =
                    this.downPaymentChoose === 'percentage'
                        ? (homeValue *
                              parseFloat(
                                  this.uiElements.mdcElement.percentageInput
                                      .value
                              )) /
                          100
                        : parseFloat(
                              this.uiElements.mdcElement.amountInput.value
                          );

                const includeTaxes = this.includeTaxes;
                const propertyTaxRate = includeTaxes
                    ? parseFloat(
                          this.uiElements.mdcElement.propertyTaxRateInput.value
                      ) / 100
                    : 0;

                const loanAmount = homeValue - downPayment;
                const monthlyInterestRate = interestRate / 12;
                const numberOfPayments = loanTerm * 12;

                const monthlyPrincipalAndInterest =
                    (loanAmount *
                        (monthlyInterestRate *
                            Math.pow(
                                1 + monthlyInterestRate,
                                numberOfPayments
                            ))) /
                    (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);

                const monthlyPropertyTax = includeTaxes
                    ? (homeValue * propertyTaxRate) / 12
                    : 0;

                const totalMonthlyPayment =
                    monthlyPrincipalAndInterest + monthlyPropertyTax;

                const formatter = new Intl.NumberFormat('en-US', {
                    style: 'decimal',
                });
                const totalMonthlyPaymentDisplay = formatter.format(
                    totalMonthlyPayment.toFixed(2)
                );

                this.uiElements.monthlyPayment.innerText =
                    totalMonthlyPaymentDisplay;
                this.uiElements.resultContainer.classList.remove('hidden');
                this._scrollDown();
            }
        );
    },
    
    _scrollDown() {
        document.body.scrollTo({
          top: document.body.scrollHeight,
          behavior: 'smooth'
        });
      },
      
    _getErrorMessagesStr() {
        for (const key in this._errMessages) {
            if (Object.hasOwnProperty.call(this._errMessages, key)) {
                buildfire.language.get(
                    { stringKey: `plugin.${key}` },
                    (err, result) => {
                        if (err)
                            return console.error(
                                'Error while retrieving string value',
                                err
                            );
                        this._errMessages[key] = result;
                    }
                );
            }
        }
    },
};

widgetUI.init();
