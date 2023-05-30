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
    },

    init() {
        this._setIntroduction();
        this._getErrorMessagesStr();
        this._initMDCComponents();
        this._radioButtonsToggle();
        this._switchButtonsToggle();
        this._onSubmit();

        buildfire.messaging.onReceivedMessage = (message) => {
            if (message.scope === 'introduction') {
                this.uiElements.introduction.innerHTML = message.introduction;
            }
        };
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
        this._ErrMsgToggle();
    },

    _radioButtonsToggle() {
        this.uiElements.downPaymentRadioButtons.forEach((radio) => {
            radio.addEventListener('change', (e) => {
                this.downPaymentChoose = e.target.value;
                if (this.downPaymentChoose === 'percentage') {
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
                        let prefixElement =
                            this.uiElements.mdcElement.percentageInput.input_
                                .previousElementSibling;
                        prefixElement.classList.remove('hidden');
                        this.uiElements.mdcElement.percentageInput.helperText_.root_.classList.add(
                            'hidden'
                        );
                    }
                } else {
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
                        let prefixElement =
                            this.uiElements.mdcElement.amountInput.input_
                                .previousElementSibling;
                        prefixElement.classList.remove('hidden');
                        this.uiElements.mdcElement.amountInput.helperText_.root_.classList.add(
                            'hidden'
                        );
                    }
                }
            });
        });
    },

    _validationsHandler(element) {
        if (element.valid) {
            element.helperText_.root_.classList.add('hidden');
            if (element.value.trim() === '') {
                let prefixElement = element.input_.previousElementSibling;
                prefixElement.classList.add('hidden');
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
            (element.value === '0' || element.value > '100')
        ) {
            element.helperText_.foundation_.adapter_.setContent(
                this._errMessages.inputNotValidMessage
            );
        } else if (
            (element.input_.id === 'percentage' ||
                element.input_.id === 'annualInterestRate' ||
                element.input_.id === 'propertyTaxRate') &&
            element.value > '100'
        ) {
            element.helperText_.foundation_.adapter_.setContent(
                this._errMessages.inputMaximumMessage
            );
        } else {
            if (
                element.value.trim() !== '' &&
                element.min.trim() !== '' &&
                Number(element.value) < 0
            ) {
                element.helperText_.foundation_.adapter_.setContent(
                    this._errMessages.inputNotValidMessage
                );
            } else if (element.input_.validity.badInput) {
                element.helperText_.foundation_.adapter_.setContent(
                    this._errMessages.inputNotValidMessage
                );
            } else {
                element.helperText_.foundation_.adapter_.setContent(
                    this._errMessages.inputRequiredMessage
                );
            }
        }
        element.helperText_.root_.classList.remove('hidden');
        if (element.value.trim() === '') {
            let prefixElement = element.input_.previousElementSibling;
            prefixElement.classList.add('hidden');
        }
    },

    _ErrMsgToggle() {
        for (const key in this.uiElements.mdcElement) {
            if (
                this.uiElements.mdcElement.hasOwnProperty.call(
                    this.uiElements.mdcElement,
                    key
                )
            ) {
                const element = this.uiElements.mdcElement[key];
                if (element) {
                    element.input_.addEventListener('keyup', () => {
                        this.uiElements.resultContainer.classList.add('hidden');
                    });
                    element.input_.addEventListener('focusout', () => {
                        this._validationsHandler(element);
                    });

                    element.input_.onfocus = (e) => {
                        let prefixElement =
                            element.input_.previousElementSibling;
                        prefixElement.classList.remove('hidden');
                    };
                }
            }
        }
    },

    _switchButtonsToggle() {
        this.uiElements.propertyTaxSwitch.addEventListener('change', (e) => {
            if (e.target.checked) {
                this.includeTaxes = true;
                this.uiElements.mdcElement.propertyTaxRateInput.input_.required = true;
                this.uiElements.propertyTaxContainer.classList.remove('hidden');
            } else {
                this.includeTaxes = false;
                this.uiElements.mdcElement.propertyTaxRateInput.input_.required = false;
                this.uiElements.propertyTaxContainer.classList.add('hidden');
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
            }
        );
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
