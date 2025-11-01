(function () {
  var $$ = function (sel, root) {
    var context = root || document;
    return Array.prototype.slice.call(context.querySelectorAll(sel));
  };

  var num = function (value) {
    var normalized = parseFloat(String(value == null ? '' : value).replace(',', '.'));
    return Number.isFinite(normalized) ? normalized : 0;
  };

  function initCalc() {
          var calcGrid = document.querySelector('.calc-grid');
          var proToggle = document.querySelector('#proToggle,[data-pro-toggle]');
          var proPane = document.querySelector('#calc-pro,[data-pro-pane]');
          var resultBox = document.querySelector('#calc-result,[data-result]');
          var materialSelect = document.getElementById('materialSelect');
          var materialDensityHint = document.getElementById('materialDensityHint');
          var materialDensityResetButton = document.getElementById('materialDensityReset');
          var pricePerKgInput = document.getElementById('pricePerKg');
          var priceSuggestionButton = document.getElementById('priceSuggestionButton');
          var priceSuggestionSrText = document.getElementById('priceSuggestionSrText');
          var weightInput = document.getElementById('partWeight');
          var lengthInput = document.getElementById('filamentLength');
          var weightMode = document.getElementById('modeWeight');
          var lengthMode = document.getElementById('modeLength');
          var weightField = document.querySelector('[data-field="weight"]');
          var lengthField = document.querySelector('[data-field="length"]');
          var timeInput = document.getElementById('printTime');
          var powerInput = document.getElementById('powerDraw');
          var energyPriceInput = document.getElementById('energyPrice');
          var loadFactorInput = document.getElementById('loadFactor');
          var vatCheckbox = document.getElementById('includeVat');
          var materialCostOutput = document.getElementById('materialCost');
          var energyCostOutput = document.getElementById('energyCost');
          var totalNetOutput = document.getElementById('totalNet');
          var totalGrossOutput = document.getElementById('totalGross');
          var grossLabelOutput = document.getElementById('grossLabel');
          var metaOutput = document.getElementById('calcMeta');
          var materialCostLabelOutput = document.getElementById('materialCostLabel');
          var energyCostLabelOutput = document.getElementById('energyCostLabel');
          var co2Output = document.getElementById('co2Output');
          var co2ValueOutput = document.getElementById('co2Value');
          var materialWasteRow = document.querySelector('[data-result="materialWaste"]');
          var materialWasteOutput = document.getElementById('materialWasteCost');
          var materialTotalRow = document.querySelector('[data-result="materialTotal"]');
          var materialTotalOutput = document.getElementById('materialTotalCost');
          var timeCostRow = document.querySelector('[data-result="timeCost"]');
          var timeCostOutput = document.getElementById('timeCost');
          var machineCostOutput = document.getElementById('machineCostValue');
          var fixedCostRow = document.querySelector('[data-result="fixedCost"]');
          var fixedCostOutput = document.getElementById('fixedCostValue');
          var subtotalRow = document.querySelector('[data-result="subtotal"]');
          var subtotalOutput = document.getElementById('subtotalValue');
          var marginRow = document.querySelector('[data-result="margin"]');
          var marginOutput = document.getElementById('marginValue');
          var discountRow = document.querySelector('[data-result="discount"]');
          var discountOutput = document.getElementById('discountValue');
          var resultChartSection = document.getElementById('resultChart');
          var resultChartBars = document.getElementById('resultChartBars');
          var resultChartToggle = document.getElementById('resultChartToggle');
          var chartNetTotalOutput = document.getElementById('chartNetTotal');
          var proStatusOutput = document.getElementById('proStatus');
          var printResultButton = document.getElementById('printResultButton');
          var printFullButton = document.getElementById('printFullButton');
          var proFields = document.getElementById('pro-fields');
          var proCard = document.getElementById('proCard');
          var proCardBody = document.getElementById('proCardBody');
          var proCollapseToggle = document.getElementById('proCollapseToggle');
          var proRows = document.querySelectorAll('[data-pro-row="true"]');
          var rootElement = document.documentElement;
          if (resultBox) {
            resultBox.dataset.ready = 'true';
          }
          var suppressCalcEvent = false;
          var profitMarginInput = document.getElementById('profitMargin');
          var hourlyRateInput = document.getElementById('hourlyRate');
          var setupMinutesInput = document.getElementById('setupMinutes');
          var proPrintMinutesInput = document.getElementById('proPrintMinutes');
          var finishingMinutesInput = document.getElementById('finishingMinutes');
          var wastePercentInput = document.getElementById('wastePercent');
          var fixedCostInput = document.getElementById('fixedCost');
          var discountPercentInput = document.getElementById('discountPercent');
          var errorRateInput = document.getElementById('errorRate');
          var packagingCostInput = document.getElementById('packagingCost');
          var shippingCostInput = document.getElementById('shippingCost');
          var machineHourlyInput = document.getElementById('machineHourlyRate');
          var machinePurchaseInput = document.getElementById('machinePurchase');
          var machineLifetimeInput = document.getElementById('machineLifetime');
          var machineAutoHint = document.getElementById('machineAutoHint');
          var materialDensityInput = document.getElementById('proDensity');
          var partNameInput = document.getElementById('partName');
          var offerFields = $$('[data-offer-field]');
          var offerFieldMap = {};
          offerFields.forEach(function (field) {
            var key = field.getAttribute('data-offer-field');
            if (key) {
              offerFieldMap[key] = field;
            }
          });
          var offerRememberToggle = document.querySelector('[data-offer-remember]');
          var offerSections = document.querySelectorAll('[data-offer-section]');
          var offerAccordionMediaQuery = window.matchMedia ? window.matchMedia('(max-width: 47.99rem)') : null;
          var printOfferColumnsContainer = document.querySelector('.calc-print__offer-columns');
          var printOfferColumns = {
            vendor: document.querySelector('[data-offer-column="vendor"]'),
            customer: document.querySelector('[data-offer-column="customer"]')
          };
          function findOfferPrintRow(rowKey, valueId) {
            return {
              row: document.querySelector('[data-offer-row="' + rowKey + '"]'),
              value: document.getElementById(valueId)
            };
          }
          var printOfferRows = {
            vendorName: findOfferPrintRow('vendorName', 'printOfferVendorName'),
            vendorContact: findOfferPrintRow('vendorContact', 'printOfferVendorContact'),
            vendorStreet: findOfferPrintRow('vendorStreet', 'printOfferVendorStreet'),
            vendorPostal: findOfferPrintRow('vendorPostal', 'printOfferVendorPostal'),
            vendorEmail: findOfferPrintRow('vendorEmail', 'printOfferVendorEmail'),
            vendorPhone: findOfferPrintRow('vendorPhone', 'printOfferVendorPhone'),
            vendorVat: findOfferPrintRow('vendorVat', 'printOfferVendorVat'),
            customerName: findOfferPrintRow('customerName', 'printOfferCustomerName'),
            customerContact: findOfferPrintRow('customerContact', 'printOfferCustomerContact'),
            customerStreet: findOfferPrintRow('customerStreet', 'printOfferCustomerStreet'),
            customerPostal: findOfferPrintRow('customerPostal', 'printOfferCustomerPostal'),
            customerEmail: findOfferPrintRow('customerEmail', 'printOfferCustomerEmail'),
            customerPhone: findOfferPrintRow('customerPhone', 'printOfferCustomerPhone')
          };
          var printOfferMetaContainer = document.querySelector('.calc-print__offer-meta');
          var printOfferMetaItems = {
            number: document.querySelector('[data-offer-meta="number"]'),
            date: document.querySelector('[data-offer-meta="date"]'),
            validUntil: document.querySelector('[data-offer-meta="validUntil"]'),
            delivery: document.querySelector('[data-offer-meta="delivery"]'),
            payment: document.querySelector('[data-offer-meta="payment"]')
          };
          var printOfferMetaValues = {
            number: document.getElementById('printOfferNumber'),
            date: document.getElementById('printOfferDate'),
            validUntil: document.getElementById('printOfferValidUntil'),
            delivery: document.getElementById('printOfferDelivery'),
            payment: document.getElementById('printOfferPayment')
          };

          var printMaterialOutput = document.getElementById('printMaterial');
          var printMaterialPriceOutput = document.getElementById('printMaterialPrice');
          var printModeOutput = document.getElementById('printMode');
          var printWeightOutput = document.getElementById('printWeight');
          var printLengthOutput = document.getElementById('printLength');
          var printTimeOutput = document.getElementById('printDuration');
          var printPowerOutput = document.getElementById('printPower');
          var printEnergyPriceOutput = document.getElementById('printEnergyPrice');
          var printLoadFactorOutput = document.getElementById('printLoadFactor');
          var printMaterialTotalOutput = document.getElementById('printMaterialTotal');
          var printEnergyCostOutput = document.getElementById('printEnergyCost');
          var printTimeCostOutput = document.getElementById('printTimeCost');
          var printFixedCostOutput = document.getElementById('printFixedCost');
          var printSubtotalOutput = document.getElementById('printSubtotal');
          var printMarginOutput = document.getElementById('printMargin');
          var printDiscountOutput = document.getElementById('printDiscount');
          var printNetOutput = document.getElementById('printNet');
          var printGrossOutput = document.getElementById('printGross');
          var printTotalOutput = document.getElementById('printTotal');
          var printResultGrid = document.querySelector('.calc-print__result-grid');
          var printSummaryItemTime = printTimeCostOutput ? printTimeCostOutput.closest('.calc-print__item') : null;
          var printSummaryItemMachine = null;
          var printSummaryItemFixed = printFixedCostOutput ? printFixedCostOutput.closest('.calc-print__item') : null;
          var printSummaryItemMargin = printMarginOutput ? printMarginOutput.closest('.calc-print__item') : null;
          var printSummaryItemDiscount = printDiscountOutput ? printDiscountOutput.closest('.calc-print__item') : null;
          var printMachineCostOutput = document.getElementById('printMachineCost');
          if (printMachineCostOutput) {
            printSummaryItemMachine = printMachineCostOutput.closest('.calc-print__item');
          }
          var printErrorRateOutput = document.getElementById('printErrorRate');
          var printPackagingCostOutput = document.getElementById('printPackagingCost');
          var printShippingCostOutput = document.getElementById('printShippingCost');
          var printMachineHourlyOutput = document.getElementById('printMachineHourly');
          var printMachinePurchaseOutput = document.getElementById('printMachinePurchase');
          var printMachineLifetimeOutput = document.getElementById('printMachineLifetime');
          var printMaterialDensityOutput = document.getElementById('printMaterialDensity');
          var printHeaderPartName = document.getElementById('printHeaderPartName');
          var printHeaderPartNameValue = document.getElementById('printHeaderPartNameValue');
          var printInputsPartName = document.getElementById('printInputsPartName');
          var printInputsPartNameValue = document.getElementById('printInputsPartNameValue');
          var printTotalContextOutput = document.getElementById('printTotalContext');
          var printChartSection = document.getElementById('printChartSection');
          var printChartBarsOutput = document.getElementById('printChartBars');
          var printChartNoteOutput = document.getElementById('printChartTotal');
          var printVatNoteOutput = document.getElementById('printVatNote');
          var printInputsSection = document.getElementById('printInputsSection');
          var printInputsTable = document.getElementById('printInputsTable');
          var printProParamsSection = document.getElementById('printProParams');
          var printProfitMarginOutput = document.getElementById('printProfitMargin');
          var printHourlyRateOutput = document.getElementById('printHourlyRate');
          var printSetupMinutesOutput = document.getElementById('printSetupMinutes');
          var printProPrintMinutesOutput = document.getElementById('printProPrintMinutes');
          var printFinishingMinutesOutput = document.getElementById('printFinishingMinutes');
          var printWastePercentOutput = document.getElementById('printWastePercent');
          var printFixedCostInputOutput = document.getElementById('printFixedCostInput');
          var printDiscountPercentOutput = document.getElementById('printDiscountPercent');
          var printInputRows = {
            weight: printInputsTable ? printInputsTable.querySelector('[data-input-row="weight"]') : null,
            length: printInputsTable ? printInputsTable.querySelector('[data-input-row="length"]') : null,
            duration: printInputsTable ? printInputsTable.querySelector('[data-input-row="duration"]') : null,
            power: printInputsTable ? printInputsTable.querySelector('[data-input-row="power"]') : null,
            energyPrice: printInputsTable ? printInputsTable.querySelector('[data-input-row="energyPrice"]') : null,
            loadFactor: printInputsTable ? printInputsTable.querySelector('[data-input-row="loadFactor"]') : null,
            wastePercent: printInputsTable ? printInputsTable.querySelector('[data-input-row="wastePercent"]') : null
          };
          var printProInputRows = {
            profitMargin: printProParamsSection ? printProParamsSection.querySelector('[data-input-row="profitMargin"]') : null,
            hourlyRate: printProParamsSection ? printProParamsSection.querySelector('[data-input-row="hourlyRate"]') : null,
            setupMinutes: printProParamsSection ? printProParamsSection.querySelector('[data-input-row="setupMinutes"]') : null,
            printMinutes: printProParamsSection ? printProParamsSection.querySelector('[data-input-row="printMinutes"]') : null,
            finishingMinutes: printProParamsSection ? printProParamsSection.querySelector('[data-input-row="finishingMinutes"]') : null,
            fixedCost: printProParamsSection ? printProParamsSection.querySelector('[data-input-row="fixedCost"]') : null,
            discountPercent: printProParamsSection ? printProParamsSection.querySelector('[data-input-row="discountPercent"]') : null
          };
          var originalDocumentTitle = document.title;
          var pendingPrintTitle = null;

          var formatter = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
          var decimalFormatter = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          var integerFormatter = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 });
          var percentNumberFormatter = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 1 });
          var chartCompactPercentFormatter = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
          var co2Formatter = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
          var offerDateFormatter = new Intl.DateTimeFormat('de-DE');
          var FILAMENT_DIAMETER_MM = 1.75;
          var PRINT_MM_PER_INCH = 25.4;
          var PRINT_PAGE_WIDTH_MM = 210;
          var PRINT_PAGE_HEIGHT_MM = 297;
          var PRINT_PAGE_WIDTH_PT = PRINT_PAGE_WIDTH_MM / PRINT_MM_PER_INCH * 72;
          var PRINT_PAGE_HEIGHT_PT = PRINT_PAGE_HEIGHT_MM / PRINT_MM_PER_INCH * 72;

          var chartCollapseMediaQuery = window.matchMedia('(max-width: 359px)');
          var chartToggleInteracted = false;
          var proCardMediaQuery = window.matchMedia('(max-width: 1099px)');
          var proCardCollapsed = false;
          var offerStorageEnabled = false;
          var queueOfferSave = null;
          var OFFER_STORAGE_KEY = 'ws3d_offer_v1';
          var OFFER_COUNTER_KEY = 'ws3d_offer_counter';
          var offerEmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

          function setChartVisibility(expanded) {
            if (!resultChartSection) {
              return;
            }

            if (resultChartToggle) {
              resultChartToggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
            }

            if (expanded) {
              resultChartSection.classList.remove('is-collapsed');
              resultChartSection.setAttribute('aria-hidden', 'false');
            } else {
              resultChartSection.classList.add('is-collapsed');
              resultChartSection.setAttribute('aria-hidden', 'true');
            }
          }

          function getStorageItem(key) {
            try {
              return window.localStorage ? window.localStorage.getItem(key) : null;
            } catch (error) {
              return null;
            }
          }

          function setStorageItem(key, value) {
            try {
              if (window.localStorage) {
                window.localStorage.setItem(key, value);
              }
            } catch (error) {}
          }

          function removeStorageItem(key) {
            try {
              if (window.localStorage) {
                window.localStorage.removeItem(key);
              }
            } catch (error) {}
          }

          function applyChartMediaPreference(event) {
            if (!resultChartToggle || chartToggleInteracted) {
              return;
            }

            var shouldCollapse = event.matches;
            resultChartToggle.checked = !shouldCollapse;
            setChartVisibility(!shouldCollapse);
          }

          function updateProCollapseToggle(collapsed) {
            if (!proCollapseToggle) {
              return;
            }
            var isCollapsed = !!collapsed;
            proCollapseToggle.setAttribute('aria-expanded', isCollapsed ? 'false' : 'true');
            proCollapseToggle.textContent = isCollapsed ? 'Bereiche anzeigen' : 'Bereiche ausblenden';
          }

          function syncProCardCollapseForViewport() {
            if (!proCard || !proModeEnabled) {
              if (proCard) {
                proCard.classList.remove('is-collapsed');
              }
              if (proCardBody) {
                proCardBody.setAttribute('aria-hidden', 'true');
              }
              updateProCollapseToggle(false);
              return;
            }

            var isMobile = proCardMediaQuery.matches;
            var shouldCollapse = isMobile && proCardCollapsed;
            proCard.classList.toggle('is-collapsed', shouldCollapse);
            if (proCardBody) {
              proCardBody.setAttribute('aria-hidden', shouldCollapse ? 'true' : 'false');
            }
            if (!isMobile) {
              updateProCollapseToggle(false);
            } else {
              updateProCollapseToggle(shouldCollapse);
            }
          }

          function setProCardCollapsedState(collapsed) {
            proCardCollapsed = !!collapsed;
            syncProCardCollapseForViewport();
          }

          if (resultChartToggle) {
            setChartVisibility(!chartCollapseMediaQuery.matches);
            resultChartToggle.checked = !chartCollapseMediaQuery.matches;
            resultChartToggle.addEventListener('change', function () {
              chartToggleInteracted = true;
              setChartVisibility(resultChartToggle.checked);
            });
            if (chartCollapseMediaQuery.addEventListener) {
              chartCollapseMediaQuery.addEventListener('change', applyChartMediaPreference);
            } else if (chartCollapseMediaQuery.addListener) {
              chartCollapseMediaQuery.addListener(applyChartMediaPreference);
            }
          }

          if (proCardMediaQuery.addEventListener) {
            proCardMediaQuery.addEventListener('change', function () {
              syncProCardCollapseForViewport();
            });
          } else if (proCardMediaQuery.addListener) {
            proCardMediaQuery.addListener(function () {
              syncProCardCollapseForViewport();
            });
          }

          function updateMaterialDensityResetState(defaults) {
            if (!materialDensityResetButton || !materialDensityInput) {
              return;
            }

            var defaultsSafe = defaults || currentMaterialDefaults || {};
            var hasDensityPreset = typeof defaultsSafe.density === 'number' && isFinite(defaultsSafe.density);
            if (!hasDensityPreset) {
              materialDensityResetButton.classList.add('is-hidden');
              return;
            }

            var currentValueRaw = materialDensityInput.value != null ? materialDensityInput.value.toString().trim() : '';
            var currentValue = num(currentValueRaw);
            var differs = !isFinite(currentValue) || Math.abs(currentValue - defaultsSafe.density) > 0.001;
            if (differs) {
              materialDensityResetButton.classList.remove('is-hidden');
            } else {
              materialDensityResetButton.classList.add('is-hidden');
            }
          }

          function updateMaterialSuggestionState(defaults) {
            if (!priceSuggestionButton) {
              return;
            }

            var defaultsSafe = defaults || {};
            var hasPriceSuggestion = typeof defaultsSafe.price === 'number' && isFinite(defaultsSafe.price);
            var hasDensitySuggestion = typeof defaultsSafe.density === 'number' && isFinite(defaultsSafe.density);

            if (!hasPriceSuggestion && !hasDensitySuggestion) {
              updateMaterialDensityResetState(defaultsSafe);
              priceSuggestionButton.classList.add('is-hidden');
              priceSuggestionButton.dataset.suggestion = '';
              priceSuggestionButton.dataset.densitySuggestion = '';
              if (priceSuggestionSrText) {
                priceSuggestionSrText.textContent = '';
              }
              return;
            }

            priceSuggestionButton.dataset.suggestion = hasPriceSuggestion ? defaultsSafe.price.toString() : '';
            priceSuggestionButton.dataset.densitySuggestion = hasDensitySuggestion ? defaultsSafe.density.toString() : '';

            if (priceSuggestionSrText) {
              var srParts = [];
              if (hasPriceSuggestion) {
                srParts.push(decimalFormatter.format(defaultsSafe.price) + '\u00A0€/kg');
              }
              if (hasDensitySuggestion) {
                srParts.push(decimalFormatter.format(defaultsSafe.density) + '\u00A0g/cm³');
              }
              priceSuggestionSrText.textContent = srParts.length ? ' – ' + srParts.join(' · ') + ' übernehmen' : '';
            }

            var shouldShow = false;
            if (hasPriceSuggestion && pricePerKgInput) {
              var currentPriceRaw = pricePerKgInput.value != null ? pricePerKgInput.value.toString().trim() : '';
              if (!currentPriceRaw) {
                shouldShow = true;
              } else {
                var parsedPrice = num(currentPriceRaw);
                if (!isFinite(parsedPrice)) {
                  shouldShow = true;
                } else if (Math.abs(parsedPrice - defaultsSafe.price) > 0.001) {
                  shouldShow = true;
                }
              }
            }

            if (!shouldShow && hasDensitySuggestion && materialDensityInput) {
              var currentDensityRaw = materialDensityInput.value != null ? materialDensityInput.value.toString().trim() : '';
              if (!currentDensityRaw) {
                shouldShow = true;
              } else {
                var parsedDensity = num(currentDensityRaw);
                if (!isFinite(parsedDensity)) {
                  shouldShow = true;
                } else if (Math.abs(parsedDensity - defaultsSafe.density) > 0.001) {
                  shouldShow = true;
                }
              }
            }

            if (shouldShow) {
              priceSuggestionButton.classList.remove('is-hidden');
            } else {
              priceSuggestionButton.classList.add('is-hidden');
            }

            updateMaterialDensityResetState(defaultsSafe);
          }

          var materialData = {
            'PLA': {
              price: 20,
              gramsPerMeter: 2.98,
              density: 1.24,
              densityHint: 'Richtwert: 2,98\u00A0g/m · 1,24\u00A0g/cm³ (PLA)'
            },
            'PLA_PLUS': {
              price: 23,
              gramsPerMeter: 3.05,
              density: 1.27,
              densityHint: 'Richtwert: 3,05\u00A0g/m · 1,27\u00A0g/cm³ (PLA+)'
            },
            'PLA_SILK': {
              price: 25,
              gramsPerMeter: 2.90,
              density: 1.21,
              densityHint: 'Richtwert: 2,90\u00A0g/m · 1,21\u00A0g/cm³ (PLA Silk)'
            },
            'PETG': {
              price: 25,
              gramsPerMeter: 3.05,
              density: 1.27,
              densityHint: 'Richtwert: 3,05\u00A0g/m · 1,27\u00A0g/cm³ (PETG)'
            },
            'PETG_CF': {
              price: 55,
              gramsPerMeter: 3.20,
              density: 1.33,
              densityHint: 'Richtwert: 3,20\u00A0g/m · 1,33\u00A0g/cm³ (PETG-CF)'
            },
            'ABS': {
              price: 27,
              gramsPerMeter: 2.65,
              density: 1.10,
              densityHint: 'Richtwert: 2,65\u00A0g/m · 1,10\u00A0g/cm³ (ABS)'
            },
            'ABS_CF': {
              price: 58,
              gramsPerMeter: 2.60,
              density: 1.08,
              densityHint: 'Richtwert: 2,60\u00A0g/m · 1,08\u00A0g/cm³ (ABS-CF)'
            },
            'ASA': {
              price: 35,
              gramsPerMeter: 2.57,
              density: 1.07,
              densityHint: 'Richtwert: 2,57\u00A0g/m · 1,07\u00A0g/cm³ (ASA)'
            },
            'ASA_CF': {
              price: 60,
              gramsPerMeter: 2.70,
              density: 1.12,
              densityHint: 'Richtwert: 2,70\u00A0g/m · 1,12\u00A0g/cm³ (ASA-CF)'
            },
            'TPU': {
              price: 30,
              gramsPerMeter: 2.85,
              density: 1.19,
              densityHint: 'Richtwert: 2,85\u00A0g/m · 1,19\u00A0g/cm³ (TPU)'
            },
            'PA': {
              price: 45,
              gramsPerMeter: 2.74,
              density: 1.14,
              densityHint: 'Richtwert: 2,74\u00A0g/m · 1,14\u00A0g/cm³ (Nylon)'
            }
          };

          var currentMaterialDefaults = {};
          var pricePerKgUserEdited = false;
          var materialDensityUserEdited = false;
          var machineHourlyUserEdited = false;

          var pricePerKgProgrammatic = false;
          var materialDensityProgrammatic = false;
          var machineHourlyProgrammatic = false;

          var suppressProSync = false;
          var timeSyncInProgress = false;
          var proModeEnabled = false;

          function applyProVisibility(enabled) {
            if (proToggle) {
              proToggle.checked = enabled;
              proToggle.setAttribute('aria-expanded', enabled ? 'true' : 'false');
            }
            if (proPane) {
              proPane.classList.toggle('is-active', enabled);
              proPane.setAttribute('aria-hidden', (!enabled).toString());
              if (enabled) {
                proPane.removeAttribute('inert');
              } else {
                proPane.setAttribute('inert', '');
              }
            }
            if (proFields) {
              proFields.hidden = !enabled;
              proFields.setAttribute('aria-hidden', enabled ? 'false' : 'true');
              if (enabled) {
                proFields.removeAttribute('inert');
              } else {
                proFields.setAttribute('inert', '');
              }
            }
            if (proCardBody) {
              proCardBody.setAttribute('aria-hidden', enabled ? 'false' : 'true');
            }
            if (proRows && proRows.length) {
              proRows.forEach(function (row) {
                row.hidden = !enabled;
              });
            }
            if (proStatusOutput) {
              proStatusOutput.hidden = !enabled;
            }
            if (printProParamsSection) {
              printProParamsSection.hidden = !enabled;
            }
            if (rootElement) {
              rootElement.classList.toggle('is-pro-on', enabled);
              rootElement.classList.toggle('is-pro-off', !enabled);
            }
            if (calcGrid) {
              calcGrid.classList.toggle('pro-active', enabled);
            }
            if (!enabled && proCard) {
              proCard.classList.remove('is-collapsed');
            }
            if (enabled) {
              syncProCardCollapseForViewport();
            }
          }

          function setProModeEnabled(enabled, options) {
            var normalized = !!enabled;
            proModeEnabled = normalized;
            if (normalized) {
              proCardCollapsed = proCardMediaQuery.matches;
            }
            applyProVisibility(normalized);
            if (!normalized) {
              proCardCollapsed = false;
              updateProCollapseToggle(false);
            }
            if (!options || !options.skipRecalc) {
              recalculate();
            }
          }

          function setProState(on) {
            var enabled = !!on;
            setProModeEnabled(enabled, { skipRecalc: true });
            if (proPane) {
              proPane.classList.toggle('is-active', enabled);
              proPane.setAttribute('aria-hidden', (!enabled).toString());
            }
            recalculate();
          }

          function formatPricePlaceholder(value) {
            if (!value || !isFinite(value)) {
              return 'z.\u00A0B. 20';
            }
            var isInteger = Math.abs(value - Math.round(value)) < 0.001;
            var normalized = isInteger ? Math.round(value).toString() : value.toFixed(2);
            return normalized.replace('.', ',');
          }

          function getInputRaw(input) {
            if (!input || input.value == null) {
              return '';
            }
            return input.value.toString().trim();
          }

          function setRowVisibility(row, visible) {
            if (!row) {
              return;
            }
            row.hidden = !visible;
          }

          function normalizeFileNamePart(value) {
            var base = (value || '').toString().trim();
            if (!base) {
              return 'unbenannt';
            }
            var normalized = base;
            if (normalized.normalize) {
              normalized = normalized.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
            }
            normalized = normalized
              .replace(/ä/gi, 'ae')
              .replace(/ö/gi, 'oe')
              .replace(/ü/gi, 'ue')
              .replace(/ß/gi, 'ss');
            normalized = normalized.replace(/[^a-z0-9]+/gi, '_');
            normalized = normalized.replace(/_+/g, '_').replace(/^_+|_+$/g, '');
            return normalized || 'unbenannt';
          }

          function formatDateForFile(date) {
            var year = date.getFullYear();
            var month = String(date.getMonth() + 1).padStart(2, '0');
            var day = String(date.getDate()).padStart(2, '0');
            return year + '-' + month + '-' + day;
          }

          function formatDateForInputValue(date) {
            if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
              return '';
            }
            var tzOffset = date.getTimezoneOffset();
            var local = new Date(date.getTime() - tzOffset * 60 * 1000);
            return local.toISOString().slice(0, 10);
          }

          function storeOfferCounter(year, nextValue) {
            if (!Number.isFinite(year) || !Number.isFinite(nextValue)) {
              return;
            }
            setStorageItem(OFFER_COUNTER_KEY, JSON.stringify({ year: year, next: nextValue }));
          }

          function buildOfferNumberSuggestion() {
            var now = new Date();
            var year = now.getFullYear();
            var nextValue = 1;
            var raw = getStorageItem(OFFER_COUNTER_KEY);
            if (raw) {
              try {
                var parsed = JSON.parse(raw);
                if (parsed && parsed.year === year && typeof parsed.next === 'number' && parsed.next > 0) {
                  nextValue = parsed.next;
                }
              } catch (error) {}
            }
            var suggestion = 'ANG-' + year + '-' + String(nextValue).padStart(3, '0');
            storeOfferCounter(year, nextValue + 1);
            return suggestion;
          }

          function buildPrintFileName(mode, state) {
            var normalizedPart = normalizeFileNamePart(state.partName);
            var datePart = formatDateForFile(new Date());
            var prefix = mode === 'full' ? 'Kostenblatt_Eingaben' : 'Kostenblatt';
            var nameParts = [prefix];
            nameParts.push(normalizedPart);
            if (state.offer && state.offer.meta && state.offer.meta.number) {
              var offerNumberPart = normalizeFileNamePart(state.offer.meta.number);
              if (offerNumberPart && offerNumberPart !== normalizedPart) {
                nameParts.push(offerNumberPart);
              }
            }
            nameParts.push(datePart);
            return nameParts.join('_') + '.pdf';
          }

          function setMaterialDefaults() {
            if (!materialSelect) return;
            var selected = materialSelect.value;
            var defaults = materialData[selected] || {};
            var gramsPerMeter = defaults.gramsPerMeter;
            currentMaterialDefaults = defaults;

            if (weightInput) {
              if (gramsPerMeter) {
                weightInput.dataset.gramsPerMeter = gramsPerMeter.toFixed(2);
              } else {
                delete weightInput.dataset.gramsPerMeter;
              }
            }

            if (lengthInput) {
              if (gramsPerMeter) {
                lengthInput.dataset.gramsPerMeter = gramsPerMeter.toFixed(2);
              } else {
                delete lengthInput.dataset.gramsPerMeter;
              }
            }

            if (materialDensityHint) {
              materialDensityHint.textContent = defaults.densityHint || 'Richtwert: nach Bedarf anpassen';
            }

            if (materialDensityInput) {
              if (defaults.density && isFinite(defaults.density)) {
                materialDensityInput.placeholder = defaults.density.toFixed(2);
              } else {
                materialDensityInput.placeholder = '';
              }
              var shouldApplyDensity = !materialDensityUserEdited || !(materialDensityInput.value || '').toString().trim();
              if (shouldApplyDensity) {
                materialDensityProgrammatic = true;
                if (defaults.density && isFinite(defaults.density)) {
                  materialDensityInput.value = defaults.density.toFixed(2);
                } else {
                  materialDensityInput.value = '';
                }
                materialDensityProgrammatic = false;
                materialDensityUserEdited = false;
                materialDensityInput.removeAttribute('data-user-set');
              }
            }

            if (pricePerKgInput) {
              var placeholder = formatPricePlaceholder(defaults.price);
              pricePerKgInput.placeholder = placeholder;
            }

            updateMaterialSuggestionState(defaults);

            triggerRecalc({ immediate: true });
          }

          function parseHours(value) {
            if (!value) return 0;
            if (value instanceof Date) {
              return value.getHours() + value.getMinutes() / 60;
            }
            var parts = value.split(':');
            var hours = parseFloat(parts[0]) || 0;
            var minutes = parseFloat(parts[1]) || 0;
            return hours + minutes / 60;
          }

          function readNumber(input) {
            if (!input) return 0;
            if (input.disabled) {
              return 0;
            }
            if (typeof input.closest === 'function' && input.closest('[data-pro-pane]:not(.is-active)')) {
              return 0;
            }
            var value = num(input.value);
            if (value < 0) {
              return 0;
            }
            return value;
          }

          function computeGramsPerMeterFromDensity(density) {
            if (!density || density <= 0) {
              return 0;
            }
            var diameterCm = FILAMENT_DIAMETER_MM / 10;
            var radiusCm = diameterCm / 2;
            var crossSection = Math.PI * radiusCm * radiusCm;
            return density * crossSection * 100;
          }

          function setModeFieldState(field, input, isActive) {
            if (!field || !input) {
              return;
            }
            field.hidden = false;
            field.classList.toggle('is-inactive', !isActive);
            field.classList.toggle('is-active', !!isActive);
            if (isActive) {
              input.disabled = false;
              input.removeAttribute('aria-disabled');
              input.setAttribute('data-calc', '');
            } else {
              input.disabled = true;
              input.setAttribute('aria-disabled', 'true');
              input.removeAttribute('data-calc');
            }
          }

          function updateModeVisibility() {
            var useWeight = weightMode.checked;
            setModeFieldState(weightField, weightInput, useWeight);
            setModeFieldState(lengthField, lengthInput, !useWeight);
            triggerRecalc({ immediate: true });
          }

          function formatMinutesDisplay(totalMinutes) {
            var rounded = Math.round(totalMinutes);
            if (!rounded) {
              return '0\u00A0min';
            }
            var hoursPart = Math.floor(rounded / 60);
            var minutesPart = Math.abs(rounded % 60);
            if (hoursPart > 0) {
              if (minutesPart === 0) {
                return hoursPart + '\u00A0h';
              }
              return hoursPart + '\u00A0h ' + minutesPart + '\u00A0min';
            }
            return minutesPart + '\u00A0min';
          }

          function attachRecalcListeners(element, options) {
            if (!element) {
              return;
            }
            var opts = options || {};
            element.addEventListener('input', function (event) {
              if (typeof opts.onInput === 'function') {
                opts.onInput(event);
              }
            });
            ['change', 'blur'].forEach(function (eventName) {
              element.addEventListener(eventName, function (event) {
                if (eventName === 'change' && typeof opts.onChange === 'function') {
                  opts.onChange(event);
                }
              });
            });
          }

          function handleCalcInputEvent() {
            if (suppressCalcEvent) {
              return;
            }
            triggerRecalc();
          }

          function handleCalcChangeEvent() {
            if (suppressCalcEvent) {
              return;
            }
            triggerRecalc({ immediate: true });
          }

          function wireInputs() {
            var fields = $$('[data-calc],[data-calc-pro],[data-offer-field]');
            fields.forEach(function (el) {
              el.addEventListener('input', handleCalcInputEvent);
              el.addEventListener('change', handleCalcChangeEvent);
            });
          }

          function setPrintAttribute(mode) {
            if (!rootElement) return;
            if (mode) {
              rootElement.setAttribute('data-print', mode);
            } else {
              rootElement.removeAttribute('data-print');
            }
          }

          var recalcThrottleDelay = 0;
          function createThrottled(callback, delay) {
            var timeoutId = null;
            var lastCall = 0;
            var safeDelay = typeof delay === 'number' && delay >= 0 ? delay : 0;
            return function () {
              var now = Date.now();
              var remaining = safeDelay - (now - lastCall);
              var invoke = function () {
                timeoutId = null;
                lastCall = Date.now();
                callback();
              };
              if (remaining <= 0) {
                if (timeoutId) {
                  clearTimeout(timeoutId);
                  timeoutId = null;
                }
                invoke();
              } else if (!timeoutId) {
                timeoutId = setTimeout(invoke, Math.min(remaining, safeDelay));
              }
            };
          }

          var queueRecalc = createThrottled(function () {
            recalculate();
          }, recalcThrottleDelay);

          queueOfferSave = createThrottled(function () {
            if (offerStorageEnabled) {
              saveOfferStateToStorage();
            }
          }, 250);

          function triggerRecalc(options) {
            if (options && options.immediate) {
              recalculate();
            } else {
              queueRecalc();
            }
          }

          function cloneNodeWithStyles(node) {
            if (!node) {
              return null;
            }
            if (node.nodeType === Node.COMMENT_NODE) {
              return null;
            }
            if (node.nodeType === Node.TEXT_NODE) {
              return node.cloneNode(true);
            }
            var clone = node.cloneNode(false);
            if (node.nodeType === Node.ELEMENT_NODE) {
              var computed = window.getComputedStyle(node);
              if (computed) {
                var cssText = '';
                for (var i = 0; i < computed.length; i++) {
                  var prop = computed[i];
                  var value = computed.getPropertyValue(prop);
                  if (value) {
                    cssText += prop + ':' + value + ';';
                  }
                }
                if (cssText) {
                  clone.setAttribute('style', cssText);
                }
              }
              if (node.tagName === 'IMG' && node.getAttribute('src')) {
                clone.setAttribute('src', node.getAttribute('src'));
              }
            }
            var child = node.firstChild;
            while (child) {
              var clonedChild = cloneNodeWithStyles(child);
              if (clonedChild) {
                clone.appendChild(clonedChild);
              }
              child = child.nextSibling;
            }
            return clone;
          }

          function renderPageElement(pageElement) {
            return new Promise(function (resolve, reject) {
              try {
                var rect = pageElement.getBoundingClientRect();
                var width = Math.max(Math.ceil(rect.width), 1);
                var height = Math.max(Math.ceil(rect.height), 1);
                var clone = cloneNodeWithStyles(pageElement);
                if (!clone) {
                  reject(new Error('Leere Seite.'));
                  return;
                }
                clone.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
                var serializer = new XMLSerializer();
                var markup = serializer.serializeToString(clone);
                var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml">' + markup + '</div></foreignObject></svg>';
                var blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
                var url = URL.createObjectURL(blob);
                var image = new Image();
                image.onload = function () {
                  try {
                    URL.revokeObjectURL(url);
                  } catch (error) {
                    // ignore
                  }
                  var canvas = document.createElement('canvas');
                  canvas.width = width;
                  canvas.height = height;
                  var ctx = canvas.getContext('2d');
                  if (ctx) {
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, width, height);
                    ctx.drawImage(image, 0, 0, width, height);
                  }
                  resolve(canvas);
                };
                image.onerror = function () {
                  try {
                    URL.revokeObjectURL(url);
                  } catch (error) {
                    // ignore
                  }
                  reject(new Error('Seite konnte nicht gerendert werden.'));
                };
                image.src = url;
              } catch (error) {
                reject(error);
              }
            });
          }

          function canvasToJpegBytes(canvas) {
            var dataUrl = canvas.toDataURL('image/jpeg', 0.92);
            var base64 = dataUrl.split(',')[1] || '';
            var binary = window.atob(base64);
            var length = binary.length;
            var bytes = new Uint8Array(length);
            for (var i = 0; i < length; i++) {
              bytes[i] = binary.charCodeAt(i);
            }
            return bytes;
          }

          function buildPdfFromPages(pages) {
            var encoder = new TextEncoder();
            var chunks = [];
            var offsets = [0];
            var offset = 0;

            function write(text) {
              var bytes = encoder.encode(text);
              chunks.push(bytes);
              offset += bytes.length;
            }

            function writeBinary(data) {
              chunks.push(data);
              offset += data.length;
            }

            write('%PDF-1.3\n');

            var catalogId = 1;
            var pagesId = 2;
            var nextId = 3;
            var imageIds = [];
            var contentIds = [];
            var pageIds = [];

            for (var i = 0; i < pages.length; i++) {
              imageIds.push(nextId++);
              contentIds.push(nextId++);
              pageIds.push(nextId++);
            }

            function beginObject(id) {
              offsets[id] = offset;
              write(id + ' 0 obj\n');
            }

            function endObject() {
              write('endobj\n');
            }

            beginObject(catalogId);
            write('<< /Type /Catalog /Pages ' + pagesId + ' 0 R >>\n');
            endObject();

            beginObject(pagesId);
            write('<< /Type /Pages /Count ' + pages.length + ' /Kids [');
            for (var k = 0; k < pageIds.length; k++) {
              write(pageIds[k] + ' 0 R ');
            }
            write('] >>\n');
            endObject();

            for (var index = 0; index < pages.length; index++) {
              var page = pages[index];
              var imageId = imageIds[index];
              var contentId = contentIds[index];
              var pageId = pageIds[index];

              beginObject(imageId);
              write('<< /Type /XObject /Subtype /Image /Width ' + page.width + ' /Height ' + page.height + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + page.bytes.length + ' >>\n');
              write('stream\n');
              writeBinary(page.bytes);
              write('\nendstream\n');
              endObject();

              var content = 'q\n' + PRINT_PAGE_WIDTH_PT.toFixed(2) + ' 0 0 ' + PRINT_PAGE_HEIGHT_PT.toFixed(2) + ' 0 0 cm\n/Im' + (index + 1) + ' Do\nQ\n';
              beginObject(contentId);
              write('<< /Length ' + content.length + ' >>\n');
              write('stream\n');
              write(content);
              write('endstream\n');
              endObject();

              beginObject(pageId);
              write('<< /Type /Page /Parent ' + pagesId + ' 0 R /MediaBox [0 0 ' + PRINT_PAGE_WIDTH_PT.toFixed(2) + ' ' + PRINT_PAGE_HEIGHT_PT.toFixed(2) + '] ');
              write('/Resources << /XObject << /Im' + (index + 1) + ' ' + imageId + ' 0 R >> /ProcSet [/PDF /ImageC] >> ');
              write('/Contents ' + contentId + ' 0 R >>\n');
              endObject();
            }

            var xrefOffset = offset;
            write('xref\n0 ' + nextId + '\n');
            write('0000000000 65535 f \n');
            for (var n = 1; n < nextId; n++) {
              var value = offsets[n] || 0;
              var padded = value.toString().padStart(10, '0');
              write(padded + ' 00000 n \n');
            }
            write('trailer\n<< /Size ' + nextId + ' /Root ' + catalogId + ' 0 R >>\n');
            write('startxref\n' + xrefOffset + '\n%%EOF');

            var totalLength = chunks.reduce(function (sum, part) {
              return sum + part.length;
            }, 0);
            var output = new Uint8Array(totalLength);
            var position = 0;
            chunks.forEach(function (part) {
              output.set(part, position);
              position += part.length;
            });
            return new Blob([output], { type: 'application/pdf' });
          }

          function cleanupStage(stage) {
            if (stage && stage.parentNode) {
              stage.parentNode.removeChild(stage);
            }
          }

          function createPrintStage(mode) {
            var summary = document.getElementById('printSummary');
            if (!summary) {
              return null;
            }
            var stage = document.createElement('div');
            stage.className = 'ws-print-stage';
            stage.style.setProperty('--ws-print-page-width', PRINT_PAGE_WIDTH_MM + 'mm');
            stage.style.setProperty('--ws-print-page-height', PRINT_PAGE_HEIGHT_MM + 'mm');
            var clone = summary.cloneNode(true);
            if (clone && clone.id) {
              clone.id = clone.id + '-export';
            }
            if (clone) {
              clone.removeAttribute('aria-hidden');
            }
            stage.appendChild(clone);
            document.body.appendChild(stage);
            if (mode === 'result') {
              var inputsPage = stage.querySelector('.calc-print__page[data-page="inputs"]');
              if (inputsPage && inputsPage.parentNode) {
                inputsPage.parentNode.removeChild(inputsPage);
              }
            }
            var footer = stage.querySelector('#ws-print-footer');
            return { stage: stage, footer: footer };
          }

          function generatePdfDocument(mode) {
            var stageInfo = createPrintStage(mode);
            if (!stageInfo) {
              return Promise.reject(new Error('Keine Druckvorlage gefunden.'));
            }
            var stage = stageInfo.stage;
            var footer = stageInfo.footer;
            if (footer) {
              footer.classList.add('ws-print-footer--manual');
            }
            var pages = Array.prototype.slice.call(stage.querySelectorAll('.calc-print__page'));
            if (!pages.length) {
              cleanupStage(stage);
              return Promise.reject(new Error('Keine Seiten zum Export gefunden.'));
            }
            var canvases = [];
            var sequence = Promise.resolve();
            pages.forEach(function (page, index) {
              sequence = sequence.then(function () {
                if (footer) {
                  page.appendChild(footer);
                  var pageNumber = footer.querySelector('.ws-pageno');
                  if (pageNumber) {
                    pageNumber.textContent = 'Seite ' + (index + 1) + ' / ' + pages.length;
                  }
                }
                return renderPageElement(page).then(function (canvas) {
                  canvases.push(canvas);
                }).finally(function () {
                  if (footer && footer.parentNode === page) {
                    footer.parentNode.removeChild(footer);
                  }
                });
              });
            });
            return sequence.then(function () {
              if (footer) {
                footer.classList.remove('ws-print-footer--manual');
                var footerNumber = footer.querySelector('.ws-pageno');
                if (footerNumber) {
                  footerNumber.textContent = '';
                }
              }
              cleanupStage(stage);
              return canvases;
            }).catch(function (error) {
              if (footer) {
                footer.classList.remove('ws-print-footer--manual');
                var footerNumber = footer.querySelector('.ws-pageno');
                if (footerNumber) {
                  footerNumber.textContent = '';
                }
              }
              cleanupStage(stage);
              throw error;
            });
          }

          function downloadBlob(blob, fileName) {
            var url = URL.createObjectURL(blob);
            var link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(function () {
              try {
                URL.revokeObjectURL(url);
              } catch (error) {
                // ignore
              }
            }, 1000);
          }

          function fallbackPrint(mode) {
            try {
              setPrintAttribute(mode);
              window.print();
            } catch (error) {
              console.error('Fallback-Druck fehlgeschlagen', error);
              setPrintAttribute(null);
              if (pendingPrintTitle !== null) {
                document.title = originalDocumentTitle;
                pendingPrintTitle = null;
              }
            }
          }

          function exportPdf(mode) {
            var resolvedMode = mode === 'result' ? 'result' : 'full';
            setPrintAttribute(resolvedMode);
            var state = recalculate();
            var fileTitle = state ? buildPrintFileName(resolvedMode, state) : null;
            if (!fileTitle) {
              fileTitle = 'warenschmiede-angebot.pdf';
            }
            pendingPrintTitle = fileTitle;
            document.title = fileTitle;
            var usedFallback = false;
            return generatePdfDocument(resolvedMode).then(function (canvases) {
              if (!canvases || !canvases.length) {
                throw new Error('Keine Seiten zum Export verfügbar.');
              }
              var pages = canvases.map(function (canvas) {
                return {
                  width: canvas.width,
                  height: canvas.height,
                  bytes: canvasToJpegBytes(canvas)
                };
              });
              var pdfBlob = buildPdfFromPages(pages);
              downloadBlob(pdfBlob, fileTitle);
              if (pendingPrintTitle !== null) {
                document.title = originalDocumentTitle;
                pendingPrintTitle = null;
              }
            }).catch(function (error) {
              console.error('PDF-Export fehlgeschlagen', error);
              usedFallback = true;
              fallbackPrint(resolvedMode);
            }).finally(function () {
              if (!usedFallback) {
                setPrintAttribute(null);
              }
            });
          }

          function hasValue(value) {
            return Math.abs(value) > 0.005;
          }

          function syncProMinutesFromTime(hours) {
            if (!proPrintMinutesInput || suppressProSync || timeSyncInProgress) {
              return;
            }
            if (document.activeElement === proPrintMinutesInput) {
              return;
            }
            timeSyncInProgress = true;
            try {
              var minutes = Math.round(hours * 60);
              if (!minutes) {
                proPrintMinutesInput.value = '';
              } else {
                proPrintMinutesInput.value = minutes.toString();
              }
            } finally {
              timeSyncInProgress = false;
            }
          }

          function updateTimeFromProMinutes() {
            if (!proPrintMinutesInput || !timeInput || timeSyncInProgress) {
              return;
            }
            suppressProSync = true;
            timeSyncInProgress = true;
            try {
              var minutes = Math.max(readNumber(proPrintMinutesInput), 0);
              var hoursPart = Math.floor(minutes / 60);
              var minutesPart = Math.round(minutes % 60);
              var hh = String(hoursPart).padStart(2, '0');
              var mm = String(minutesPart).padStart(2, '0');
              timeInput.value = hh + ':' + mm;
            } finally {
              timeSyncInProgress = false;
              suppressProSync = false;
            }
            recalculate();
          }

          function getOfferValue(key) {
            var field = offerFieldMap[key];
            if (!field) {
              return '';
            }
            var raw = field.value;
            return raw == null ? '' : raw.toString().trim();
          }

          function suggestOfferNumber() {
            var field = offerFieldMap.offerNumber;
            if (!field) {
              return;
            }
            var current = field.value != null ? field.value.toString().trim() : '';
            if (current) {
              return;
            }
            var suggestion = buildOfferNumberSuggestion();
            if (suggestion) {
              field.value = suggestion;
            }
          }

          function setOfferDefaults() {
            if (!offerFieldMap) {
              return;
            }
            var today = new Date();
            var offerDateField = offerFieldMap.offerDate;
            if (offerDateField) {
              var current = offerDateField.value != null ? offerDateField.value.toString().trim() : '';
              if (!current) {
                offerDateField.value = formatDateForInputValue(today);
              }
            }
            var validUntilField = offerFieldMap.offerValidUntil;
            if (validUntilField) {
              var validCurrent = validUntilField.value != null ? validUntilField.value.toString().trim() : '';
              if (!validCurrent) {
                var validDate = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
                validUntilField.value = formatDateForInputValue(validDate);
              }
            }
            var deliveryField = offerFieldMap.offerDeliveryTime;
            if (deliveryField) {
              var deliveryCurrent = deliveryField.value != null ? deliveryField.value.toString().trim() : '';
              if (!deliveryCurrent) {
                deliveryField.value = '7–10 Tage ab Auftragsklarheit';
              }
            }
            var paymentField = offerFieldMap.offerPaymentTerms;
            if (paymentField) {
              var paymentCurrent = paymentField.value != null ? paymentField.value.toString().trim() : '';
              if (!paymentCurrent) {
                paymentField.value = 'Vorkasse / 14 Tage netto';
              }
            }
            suggestOfferNumber();
          }

          function hasNonEmptyValue(values) {
            if (!values || !values.length) {
              return false;
            }
            for (var i = 0; i < values.length; i += 1) {
              var value = values[i];
              if (value != null && value.toString().trim().length > 0) {
                return true;
              }
            }
            return false;
          }

          function collectOfferState() {
            var fields = {};
            Object.keys(offerFieldMap).forEach(function (key) {
              fields[key] = getOfferValue(key);
            });
            var vendor = {
              name: fields.vendorName || '',
              contact: fields.vendorContact || '',
              street: fields.vendorStreet || '',
              postalCode: fields.vendorPostalCode || '',
              city: fields.vendorCity || '',
              email: fields.vendorEmail || '',
              phone: fields.vendorPhone || '',
              vatId: fields.vendorVatId || ''
            };
            var customer = {
              name: fields.customerName || '',
              contact: fields.customerContact || '',
              street: fields.customerStreet || '',
              postalCode: fields.customerPostalCode || '',
              city: fields.customerCity || '',
              email: fields.customerEmail || '',
              phone: fields.customerPhone || ''
            };
            var meta = {
              number: fields.offerNumber || '',
              date: fields.offerDate || '',
              validUntil: fields.offerValidUntil || '',
              deliveryTime: fields.offerDeliveryTime || '',
              paymentTerms: fields.offerPaymentTerms || ''
            };
            var hasVendor = hasNonEmptyValue([
              vendor.name,
              vendor.contact,
              vendor.street,
              vendor.postalCode,
              vendor.city,
              vendor.email,
              vendor.phone,
              vendor.vatId
            ]);
            var hasCustomer = hasNonEmptyValue([
              customer.name,
              customer.contact,
              customer.street,
              customer.postalCode,
              customer.city,
              customer.email,
              customer.phone
            ]);
            var hasMeta = hasNonEmptyValue([
              meta.number,
              meta.date,
              meta.validUntil,
              meta.deliveryTime,
              meta.paymentTerms
            ]);
            return {
              fields: fields,
              vendor: vendor,
              customer: customer,
              meta: meta,
              hasVendor: hasVendor,
              hasCustomer: hasCustomer,
              hasMeta: hasMeta
            };
          }

          function applyOfferState(data) {
            if (!data || !data.fields) {
              return;
            }
            Object.keys(data.fields).forEach(function (key) {
              var field = offerFieldMap[key];
              if (field) {
                var value = data.fields[key];
                field.value = value == null ? '' : value;
              }
            });
          }

          function loadOfferStateFromStorage() {
            var raw = getStorageItem(OFFER_STORAGE_KEY);
            if (!raw) {
              return null;
            }
            try {
              var data = JSON.parse(raw);
              if (!data || data.remember !== true || !data.fields) {
                return null;
              }
              applyOfferState(data);
              setOfferRemember(true, { skipSave: true, skipToggle: false });
              return data;
            } catch (error) {
              return null;
            }
          }

          function saveOfferStateToStorage() {
            if (!offerStorageEnabled) {
              return;
            }
            var state = collectOfferState();
            var payload = {
              remember: true,
              fields: state.fields,
              timestamp: new Date().toISOString()
            };
            setStorageItem(OFFER_STORAGE_KEY, JSON.stringify(payload));
          }

          function setOfferRemember(enabled, options) {
            var opts = options || {};
            offerStorageEnabled = !!enabled;
            if (offerRememberToggle && !opts.skipToggle) {
              offerRememberToggle.checked = offerStorageEnabled;
            }
            if (offerStorageEnabled) {
              if (!opts.skipSave) {
                saveOfferStateToStorage();
              }
            } else {
              removeStorageItem(OFFER_STORAGE_KEY);
            }
          }

          function scheduleOfferSave() {
            if (offerStorageEnabled && typeof queueOfferSave === 'function') {
              queueOfferSave();
            }
          }

          function validateOfferField(field) {
            if (!field) {
              return true;
            }
            var value = field.value != null ? field.value.toString().trim() : '';
            var isEmailField = field.type === 'email' || /email/i.test(field.name || '');
            var isValid = true;
            if (isEmailField && value) {
              isValid = offerEmailPattern.test(value);
            }
            if (isValid) {
              field.classList.remove('is-invalid');
              field.removeAttribute('aria-invalid');
            } else {
              field.classList.add('is-invalid');
              field.setAttribute('aria-invalid', 'true');
            }
            return isValid;
          }

          function handleOfferFieldInput(field) {
            validateOfferField(field);
            scheduleOfferSave();
          }

          function attachOfferFieldListeners() {
            offerFields.forEach(function (field) {
              field.addEventListener('input', function () {
                handleOfferFieldInput(field);
              });
              field.addEventListener('change', function () {
                handleOfferFieldInput(field);
              });
              field.addEventListener('blur', function () {
                var trimmed = field.value != null ? field.value.toString().trim() : '';
                field.value = trimmed;
                handleOfferFieldInput(field);
              });
            });
          }

          function syncOfferAccordionForViewport() {
            if (!offerSections || !offerSections.length) {
              return;
            }
            if (!offerAccordionMediaQuery || !offerAccordionMediaQuery.matches) {
              offerSections.forEach(function (section) {
                if (section && !section.open) {
                  section.open = true;
                }
              });
            }
          }

          function initializeOfferSection() {
            loadOfferStateFromStorage();
            setOfferDefaults();
            attachOfferFieldListeners();
            offerFields.forEach(function (field) {
              validateOfferField(field);
            });
            if (offerRememberToggle) {
              offerRememberToggle.addEventListener('change', function () {
                setOfferRemember(offerRememberToggle.checked);
                triggerRecalc({ immediate: true });
              });
            }
            syncOfferAccordionForViewport();
            if (offerAccordionMediaQuery) {
              var handleAccordionChange = function (event) {
                if (!event.matches) {
                  syncOfferAccordionForViewport();
                }
              };
              if (typeof offerAccordionMediaQuery.addEventListener === 'function') {
                offerAccordionMediaQuery.addEventListener('change', handleAccordionChange);
              } else if (typeof offerAccordionMediaQuery.addListener === 'function') {
                offerAccordionMediaQuery.addListener(handleAccordionChange);
              }
            }
            if (offerStorageEnabled) {
              saveOfferStateToStorage();
            }
          }

          function formatOfferDateDisplay(value) {
            if (!value) {
              return '';
            }
            var trimmed = value.toString().trim();
            if (!trimmed) {
              return '';
            }
            var parsed = new Date(trimmed);
            if (Number.isNaN(parsed.getTime())) {
              return trimmed;
            }
            return offerDateFormatter.format(parsed);
          }

          function setOfferPrintRow(key, value) {
            var entry = printOfferRows[key];
            if (!entry || !entry.value) {
              return;
            }
            var text = value != null ? value.toString().trim() : '';
            entry.value.textContent = text || '–';
            if (entry.row) {
              if (text) {
                entry.row.hidden = false;
                entry.row.removeAttribute('hidden');
              } else {
                entry.row.hidden = true;
              }
            }
          }

          function setOfferMetaItem(key, value) {
            var item = printOfferMetaItems[key];
            var valueElement = printOfferMetaValues[key];
            var text = value != null ? value.toString().trim() : '';
            if (valueElement) {
              valueElement.textContent = text || '–';
            }
            if (item) {
              item.hidden = !text;
            }
            return !!text;
          }

          function updatePrintOffer(offerState) {
            var state = offerState || {};
            var vendor = state.vendor || {};
            var customer = state.customer || {};
            var meta = state.meta || {};
            var vendorPostalLine = '';
            if (vendor.postalCode || vendor.city) {
              vendorPostalLine = [vendor.postalCode, vendor.city].filter(Boolean).join(' ');
            }
            var customerPostalLine = '';
            if (customer.postalCode || customer.city) {
              customerPostalLine = [customer.postalCode, customer.city].filter(Boolean).join(' ');
            }
            setOfferPrintRow('vendorName', vendor.name);
            setOfferPrintRow('vendorContact', vendor.contact);
            setOfferPrintRow('vendorStreet', vendor.street);
            setOfferPrintRow('vendorPostal', vendorPostalLine);
            setOfferPrintRow('vendorEmail', vendor.email);
            setOfferPrintRow('vendorPhone', vendor.phone);
            setOfferPrintRow('vendorVat', vendor.vatId);
            setOfferPrintRow('customerName', customer.name);
            setOfferPrintRow('customerContact', customer.contact);
            setOfferPrintRow('customerStreet', customer.street);
            setOfferPrintRow('customerPostal', customerPostalLine);
            setOfferPrintRow('customerEmail', customer.email);
            setOfferPrintRow('customerPhone', customer.phone);
            if (printOfferColumns.vendor) {
              if (state.hasVendor) {
                printOfferColumns.vendor.hidden = false;
                printOfferColumns.vendor.removeAttribute('hidden');
              } else {
                printOfferColumns.vendor.hidden = true;
              }
            }
            if (printOfferColumns.customer) {
              if (state.hasCustomer) {
                printOfferColumns.customer.hidden = false;
                printOfferColumns.customer.removeAttribute('hidden');
              } else {
                printOfferColumns.customer.hidden = true;
              }
            }
            if (printOfferColumnsContainer) {
              var showColumns = !!state.hasVendor || !!state.hasCustomer;
              printOfferColumnsContainer.hidden = !showColumns;
            }
            var metaVisible = false;
            metaVisible = setOfferMetaItem('number', meta.number) || metaVisible;
            metaVisible = setOfferMetaItem('date', formatOfferDateDisplay(meta.date)) || metaVisible;
            metaVisible = setOfferMetaItem('validUntil', formatOfferDateDisplay(meta.validUntil)) || metaVisible;
            metaVisible = setOfferMetaItem('delivery', meta.deliveryTime) || metaVisible;
            metaVisible = setOfferMetaItem('payment', meta.paymentTerms) || metaVisible;
            if (printOfferMetaContainer) {
              printOfferMetaContainer.hidden = !metaVisible;
            }
          }

          function computeState() {
            var partNameRaw = getInputRaw(partNameInput);
            var partNameTrimmed = partNameRaw ? partNameRaw.trim() : '';
            if (partNameTrimmed.length > 80) {
              partNameTrimmed = partNameTrimmed.slice(0, 80);
            }
            var offerState = collectOfferState();
            var selected = materialSelect.value;
            var defaults = materialData[selected] || {};
            var gramsPerMeter = defaults.gramsPerMeter || 0;

            var pricePerKg = readNumber(pricePerKgInput);
            var proEnabled = proModeEnabled;

            var weightModeActive = !!weightMode.checked;
            var lengthModeActive = !weightModeActive;

            var timeRawValue = getInputRaw(timeInput);
            var powerRawValue = getInputRaw(powerInput);
            var energyPriceRawValue = getInputRaw(energyPriceInput);
            var loadFactorRawValue = getInputRaw(loadFactorInput);
            var wastePercentRawValue = getInputRaw(wastePercentInput);
            var profitMarginRawValue = getInputRaw(profitMarginInput);
            var hourlyRateRawValue = getInputRaw(hourlyRateInput);
            var setupMinutesRawValue = getInputRaw(setupMinutesInput);
            var proMinutesRawValue = getInputRaw(proPrintMinutesInput);
            var finishingMinutesRawValue = getInputRaw(finishingMinutesInput);
            var fixedCostRawValue = getInputRaw(fixedCostInput);
            var discountPercentRawValue = getInputRaw(discountPercentInput);
            var errorRateRawValue = getInputRaw(errorRateInput);
            var packagingCostRawValue = getInputRaw(packagingCostInput);
            var shippingCostRawValue = getInputRaw(shippingCostInput);
            var machineHourlyRawValue = getInputRaw(machineHourlyInput);
            var machinePurchaseRawValue = getInputRaw(machinePurchaseInput);
            var machineLifetimeRawValue = getInputRaw(machineLifetimeInput);
            var materialDensityRawValue = getInputRaw(materialDensityInput);

            var materialDensityValue = readNumber(materialDensityInput);
            var weightInputValue = weightModeActive ? readNumber(weightInput) : 0;
            var lengthInputValue = lengthModeActive ? readNumber(lengthInput) : 0;

            var weight = weightInputValue;
            var length = lengthInputValue;

            if (weightModeActive) {
              if (gramsPerMeter > 0 && weight > 0) {
                length = weight / gramsPerMeter;
              } else {
                length = 0;
              }
            } else {
              var gramsPerMeterFromDensity = proEnabled && materialDensityValue > 0
                ? computeGramsPerMeterFromDensity(materialDensityValue)
                : 0;
              var effectiveGramsPerMeter = gramsPerMeterFromDensity > 0 ? gramsPerMeterFromDensity : gramsPerMeter;
              if (effectiveGramsPerMeter > 0 && length > 0) {
                weight = length * effectiveGramsPerMeter;
              } else {
                weight = 0;
              }
            }

            if (!isFinite(weight) || weight < 0) {
              weight = 0;
            }
            if (!isFinite(length) || length < 0) {
              length = 0;
            }

            var hours = parseHours(timeInput.value || '0:00');
            var power = readNumber(powerInput);
            var energyPrice = readNumber(energyPriceInput);
            var loadFactorRaw = loadFactorRawValue;
            var loadFactorValue = readNumber(loadFactorInput);
            var loadFactor = Math.min(Math.max(loadFactorValue, 0), 100);
            if (!loadFactorRaw) {
              loadFactorInput.value = '';
            } else {
              var parsedLoadFactor = num(loadFactorRaw);
              if (!isFinite(parsedLoadFactor)) {
                loadFactorInput.value = '';
              } else if (Math.abs(parsedLoadFactor - loadFactor) > 0.0001) {
                loadFactorInput.value = loadFactor.toString();
              }
            }

            syncProMinutesFromTime(hours);

            var materialCost = (weight / 1000) * pricePerKg;
            var wastePercent = wastePercentInput ? readNumber(wastePercentInput) : 0;
            if (wastePercentInput && wastePercent > 100) {
              wastePercent = 100;
              wastePercentInput.value = wastePercent.toString();
            } else if (!wastePercentRawValue && wastePercentInput) {
              wastePercent = 0;
              wastePercentInput.value = '';
            }

            var materialWaste = materialCost * (wastePercent / 100);
            var materialWithWaste = materialCost + materialWaste;
            var materialErrorValue = 0;
            var materialTotal = materialWithWaste;

            var errorRate = readNumber(errorRateInput);
            if (errorRateInput) {
              if (errorRate > 100) {
                errorRate = 100;
                errorRateInput.value = errorRate.toString();
              } else if (!errorRateRawValue) {
                errorRate = 0;
                errorRateInput.value = '';
              }
            }

            if (proEnabled && errorRate > 0) {
              materialErrorValue = materialWithWaste * (errorRate / 100);
              materialTotal = materialWithWaste + materialErrorValue;
            }
            var loadFactorShare = loadFactor / 100;
            var energyCost = (power / 1000) * hours * energyPrice * loadFactorShare;
            var co2EmissionKg = (power / 1000) * hours * loadFactorShare * 0.4;
            var co2EmissionGrams = co2EmissionKg * 1000;
            var showCo2 = power > 0 && hours > 0 && loadFactor > 0;
            var vatIncluded = !!vatCheckbox.checked;
            var machinePurchase = readNumber(machinePurchaseInput);
            var machineLifetime = readNumber(machineLifetimeInput);
            var machineHourlyManual = readNumber(machineHourlyInput);
            var packagingCost = readNumber(packagingCostInput);
            var shippingCost = readNumber(shippingCostInput);
            if (packagingCostInput && !packagingCostRawValue) {
              packagingCost = 0;
              packagingCostInput.value = '';
            }
            if (shippingCostInput && !shippingCostRawValue) {
              shippingCost = 0;
              shippingCostInput.value = '';
            }
            if (machineHourlyInput && !machineHourlyRawValue) {
              machineHourlyManual = 0;
              machineHourlyInput.value = '';
              machineHourlyUserEdited = false;
            }
            if (machinePurchaseInput && !machinePurchaseRawValue) {
              machinePurchase = 0;
              machinePurchaseInput.value = '';
            }
            if (machineLifetimeInput && !machineLifetimeRawValue) {
              machineLifetime = 0;
              machineLifetimeInput.value = '';
            }
            var hasDensityValue = !!materialDensityRawValue;
            if (materialDensityInput && !hasDensityValue) {
              materialDensityValue = 0;
            }
            var machineAutoRate = 0;
            if (machinePurchase > 0 && machineLifetime > 0) {
              machineAutoRate = machinePurchase / machineLifetime;
            }
            if (machineAutoRate > 0 && machineHourlyInput) {
              var machineHourlyCurrentRaw = machineHourlyInput.value != null ? machineHourlyInput.value.toString().trim() : '';
              var hasCurrentHourly = machineHourlyCurrentRaw.length > 0;
              if (!machineHourlyUserEdited || !hasCurrentHourly) {
                machineHourlyProgrammatic = true;
                machineHourlyInput.value = machineAutoRate.toFixed(2);
                machineHourlyProgrammatic = false;
                machineHourlyUserEdited = false;
                machineHourlyManual = machineAutoRate;
              }
            }
            if (machineAutoHint) {
              if (machineAutoRate > 0) {
                machineAutoHint.textContent = 'Aus Eingaben: ' + formatter.format(machineAutoRate) + ' pro Stunde.';
              } else if (machinePurchaseRawValue || machineLifetimeRawValue) {
                machineAutoHint.textContent = 'Bitte Anschaffung & Lebensdauer komplett eintragen.';
              } else {
                machineAutoHint.textContent = 'Ergibt automatisch einen €/h-Wert.';
              }
            }
            var labourMinutes = 0;
            var timeCost = 0;
            var fixedCostValue = 0;
            var standardSubtotal = materialWithWaste + energyCost;
            var marginBase = standardSubtotal;
            var marginValue = 0;
            var discountPercentValue = 0;
            var discountValue = 0;
            var netBeforeDiscount = marginBase;
            var net = marginBase;
            var gross = vatIncluded ? net * 1.19 : net;

            var defaultMinutes = Math.round(hours * 60);
            var profitMargin = 0;
            var hourlyRate = 0;
            var setupMinutes = 0;
            var proMinutes = 0;
            var finishingMinutes = 0;
            var fixedCost = 0;
            var discountPercent = 0;
            var machineHourlyEffective = 0;
            var machineCost = 0;
            var packagingValue = 0;
            var shippingValue = 0;
            var proData = {
              enabled: proEnabled,
              profitMargin: 0,
              hourlyRate: 0,
              setupMinutes: 0,
              printMinutes: defaultMinutes,
              finishingMinutes: 0,
              wastePercent: wastePercent,
              materialWaste: materialWaste,
              materialErrorPercent: proEnabled ? errorRate : 0,
              materialErrorValue: proEnabled ? materialErrorValue : 0,
              materialWithWaste: materialWithWaste,
              materialTotal: proEnabled ? materialTotal : materialWithWaste,
              labourMinutes: labourMinutes,
              timeCost: timeCost,
              fixedCost: fixedCostValue,
              fixedCostBase: proEnabled ? fixedCost : 0,
              packagingCost: 0,
              shippingCost: 0,
              machineHourly: 0,
              machineAutoHourly: machineAutoRate,
              machineCost: 0,
              machinePurchase: proEnabled ? machinePurchase : 0,
              machineLifetime: proEnabled ? machineLifetime : 0,
              marginBase: marginBase,
              subtotal: marginBase,
              marginValue: marginValue,
              discountPercent: discountPercentValue,
              discountValue: discountValue,
              netBeforeDiscount: netBeforeDiscount,
              net: net,
              gross: gross,
              standardSubtotal: standardSubtotal,
              materialDensity: proEnabled ? materialDensityValue : 0
            };

            if (proEnabled) {
              profitMargin = readNumber(profitMarginInput);
              if (profitMargin > 100) {
                profitMargin = 100;
                profitMarginInput.value = profitMargin.toString();
              }
              hourlyRate = readNumber(hourlyRateInput);
              setupMinutes = readNumber(setupMinutesInput);
              proMinutes = readNumber(proPrintMinutesInput);
              if (!proMinutes && defaultMinutes) {
                proMinutes = defaultMinutes;
                proPrintMinutesInput.value = proMinutes.toString();
              }
              finishingMinutes = readNumber(finishingMinutesInput);
              fixedCost = readNumber(fixedCostInput);
              discountPercent = readNumber(discountPercentInput);
              if (discountPercent > 100) {
                discountPercent = 100;
                discountPercentInput.value = discountPercent.toString();
              }
              packagingValue = packagingCost;
              shippingValue = shippingCost;
              machineHourlyEffective = machineHourlyManual > 0 ? machineHourlyManual : machineAutoRate;
              standardSubtotal = materialWithWaste + energyCost;
              var subtotalWithMaterial = materialTotal + energyCost;
              labourMinutes = setupMinutes + finishingMinutes;
              timeCost = (hourlyRate / 60) * labourMinutes;
              machineCost = hours * machineHourlyEffective;
              marginBase = subtotalWithMaterial + timeCost + machineCost;
              fixedCostValue = fixedCost + packagingValue + shippingValue;
              marginValue = marginBase * (profitMargin / 100);
              netBeforeDiscount = marginBase + marginValue + fixedCostValue;
              discountPercentValue = discountPercent;
              discountValue = netBeforeDiscount * (discountPercent / 100);
              var proNet = netBeforeDiscount - discountValue;
              var proGross = vatIncluded ? proNet * 1.19 : proNet;

              net = proNet;
              gross = proGross;

              proData = {
                enabled: true,
                profitMargin: profitMargin,
                hourlyRate: hourlyRate,
                setupMinutes: setupMinutes,
                printMinutes: proMinutes,
                finishingMinutes: finishingMinutes,
                wastePercent: wastePercent,
                materialWaste: materialWaste,
                materialErrorPercent: errorRate,
                materialErrorValue: materialErrorValue,
                materialWithWaste: materialWithWaste,
                materialTotal: materialTotal,
                labourMinutes: labourMinutes,
                timeCost: timeCost,
                fixedCost: fixedCostValue,
                fixedCostBase: fixedCost,
                packagingCost: packagingValue,
                shippingCost: shippingValue,
                machineHourly: machineHourlyEffective,
                machineAutoHourly: machineAutoRate,
                machineCost: machineCost,
                marginBase: marginBase,
                subtotal: marginBase,
                marginValue: marginValue,
                discountPercent: discountPercentValue,
                discountValue: discountValue,
                netBeforeDiscount: netBeforeDiscount,
                net: proNet,
                gross: proGross,
                standardSubtotal: standardSubtotal,
                materialDensity: materialDensityValue,
                machinePurchase: machinePurchase,
                machineLifetime: machineLifetime
              };
            }

            var chartEnabled = !resultChartToggle || !!resultChartToggle.checked;

            var materialLabel = materialSelect.options[materialSelect.selectedIndex]
              ? materialSelect.options[materialSelect.selectedIndex].textContent
              : selected;

            var inputVisibility = {
              weight: weightMode.checked && weight > 0,
              length: !weightMode.checked && length > 0,
              duration: hours > 0,
              power: power > 0,
              energyPrice: energyPrice > 0,
              loadFactor: !!loadFactorRawValue,
              wastePercent: !!wastePercentRawValue && wastePercent > 0,
              profitMargin: proEnabled && profitMargin > 0,
              hourlyRate: proEnabled && hourlyRate > 0,
              setupMinutes: proEnabled && setupMinutes > 0,
              printMinutes: proEnabled && proMinutes > 0,
              finishingMinutes: proEnabled && finishingMinutes > 0,
              fixedCost: proEnabled && fixedCost > 0,
              discountPercent: proEnabled && discountPercent > 0,
              errorRate: proEnabled && errorRate > 0,
              packagingCost: proEnabled && packagingValue > 0,
              shippingCost: proEnabled && shippingValue > 0,
              machineHourlyRate: proEnabled && machineHourlyEffective > 0,
              machinePurchase: proEnabled && machinePurchase > 0,
              machineLifetime: proEnabled && machineLifetime > 0,
              materialDensity: proEnabled && materialDensityValue > 0
            };

            return {
              materialLabel: materialLabel,
              pricePerKg: pricePerKg,
              modeLabel: weightMode.checked ? 'Bauteilgewicht' : 'Filamentlänge',
              weight: weight,
              length: length,
              hours: hours,
              power: power,
              energyPrice: energyPrice,
              loadFactor: loadFactor,
              co2EmissionGrams: co2EmissionGrams,
              showCo2: showCo2,
              vatIncluded: vatIncluded,
              materialCost: materialCost,
              energyCost: energyCost,
              net: net,
              gross: gross,
              standardSubtotal: standardSubtotal,
              pro: proData,
              partName: partNameTrimmed,
              hasPartName: partNameTrimmed.length > 0,
              chartEnabled: chartEnabled,
              mode: weightMode.checked ? 'weight' : 'length',
              inputs: inputVisibility,
              offer: offerState
            };
          }

          function updateResults(state) {
            materialCostOutput.textContent = formatter.format(state.materialCost);
            energyCostOutput.textContent = formatter.format(state.energyCost);
            if (co2Output && co2ValueOutput) {
              if (state.showCo2) {
                co2Output.hidden = false;
                co2Output.setAttribute('aria-hidden', 'false');
                co2ValueOutput.textContent = co2Formatter.format(state.co2EmissionGrams) + '\u00A0g';
              } else {
                co2Output.hidden = true;
                co2Output.setAttribute('aria-hidden', 'true');
              }
            }
            totalNetOutput.textContent = formatter.format(state.net);
            totalGrossOutput.textContent = formatter.format(state.gross);

            if (grossLabelOutput) {
              grossLabelOutput.textContent = state.vatIncluded ? 'Gesamtkosten (brutto)' : 'Gesamtkosten (brutto, §19 UStG)';
            }

            var weightText = integerFormatter.format(state.weight) + '\u00A0g';
            var lengthText = decimalFormatter.format(state.length) + '\u00A0m';
            var metaText = 'Gewicht: ' + weightText + ' · Länge: ' + lengthText;
            if (state.pro.enabled) {
              metaText += ' · Pro-Optionen aktiv';
            }
            metaOutput.textContent = metaText;

            materialCostLabelOutput.textContent = 'Material (Basis)';
            if (energyCostLabelOutput) {
              energyCostLabelOutput.textContent = 'Energiekosten';
            }

            if (materialWasteOutput) {
              materialWasteOutput.textContent = formatter.format(state.pro.materialWaste);
            }
            if (materialWasteRow) {
              materialWasteRow.hidden = false;
            }

            if (materialTotalOutput) {
              materialTotalOutput.textContent = formatter.format(state.pro.materialTotal);
            }
            if (materialTotalRow) {
              materialTotalRow.hidden = false;
            }

            if (timeCostOutput) {
              timeCostOutput.textContent = formatter.format(state.pro.timeCost);
            }

            if (machineCostOutput) {
              machineCostOutput.textContent = formatter.format(state.pro.machineCost);
            }

            if (fixedCostOutput) {
              fixedCostOutput.textContent = formatter.format(state.pro.fixedCost);
            }

            if (subtotalOutput) {
              var subtotalValue = state.pro.enabled ? state.pro.subtotal : state.standardSubtotal;
              subtotalOutput.textContent = formatter.format(subtotalValue);
            }

            if (marginOutput) {
              marginOutput.textContent = formatter.format(state.pro.marginValue);
            }

            if (discountOutput) {
              var discountText = hasValue(state.pro.discountValue)
                ? '– ' + formatter.format(state.pro.discountValue)
                : formatter.format(state.pro.discountValue);
              discountOutput.textContent = discountText;
            }

            renderResultChart(state);
          }

          function getCostChartData(state) {
            var items = [];
            if (state.pro.materialTotal > 0) {
              items.push({ key: 'material', label: 'Material', value: state.pro.materialTotal });
            }
            if (state.energyCost > 0) {
              items.push({ key: 'energy', label: 'Energie', value: state.energyCost });
            }
            if (state.pro.timeCost > 0) {
              items.push({ key: 'labor', label: 'Arbeitszeit', value: state.pro.timeCost });
            }
            if (state.pro.machineCost > 0) {
              items.push({ key: 'machine', label: 'Maschine', value: state.pro.machineCost });
            }
            if (state.pro.fixedCost > 0) {
              items.push({ key: 'fix', label: 'Fixkosten', value: state.pro.fixedCost });
            }
            if (state.pro.marginValue > 0) {
              items.push({ key: 'margin', label: 'Marge', value: state.pro.marginValue });
            }

            var discountValue = state.pro.discountValue > 0 ? state.pro.discountValue : 0;
            var positiveTotal = items.reduce(function (sum, item) { return sum + item.value; }, 0);
            return {
              items: items,
              discountValue: discountValue,
              positiveTotal: positiveTotal,
              hasData: items.length > 0 || discountValue > 0
            };
          }

          function renderCostBars(container, data, options) {
            if (!container) {
              return;
            }
            while (container.firstChild) {
              container.removeChild(container.firstChild);
            }

            var safeTotal = data.positiveTotal > 0 ? data.positiveTotal : 1;
            var barClass = options && options.barClass ? options.barClass : 'result-bar';
            var labelClass = options && options.labelClass ? options.labelClass : 'result-bar__label';
            var trackClass = options && options.trackClass ? options.trackClass : 'result-bar__track';
            var fillClass = options && options.fillClass ? options.fillClass : 'result-bar__fill';
            var discountClass = options && options.discountClass ? options.discountClass : barClass + '--discount';

            data.items.forEach(function (item) {
              var share = item.value / safeTotal;
              var width = share > 0 ? Math.max(Math.min(share * 100, 100), 3) : 0;
              var bar = document.createElement('div');
              bar.className = barClass + ' ' + barClass + '--' + item.key;
              bar.setAttribute('role', 'listitem');

              var percentText = safeTotal > 0 ? chartCompactPercentFormatter.format(share * 100) + '\u00A0%' : '0\u00A0%';
              var label = document.createElement('span');
              label.className = labelClass;
              label.textContent = item.label + ': ' + formatter.format(item.value) + ' (' + percentText + ')';

              var track = document.createElement('div');
              track.className = trackClass;
              var fill = document.createElement('span');
              fill.className = fillClass;
              fill.setAttribute('aria-hidden', 'true');
              fill.style.width = width + '%';

              var ariaPercentText = safeTotal > 0 ? chartCompactPercentFormatter.format(share * 100) + ' %' : '0 %';
              bar.setAttribute('aria-label', item.label + ': ' + formatter.format(item.value) + ' (' + ariaPercentText + ')');

              track.appendChild(fill);
              bar.appendChild(label);
              bar.appendChild(track);
              container.appendChild(bar);
            });

            if (data.discountValue > 0) {
              var discountShare = data.discountValue / safeTotal;
              var discountWidth = discountShare > 0 ? Math.max(Math.min(discountShare * 100, 100), 3) : 0;
              var discountBar = document.createElement('div');
              discountBar.className = barClass + ' ' + discountClass;
              discountBar.setAttribute('role', 'listitem');

              var discountPercentText = safeTotal > 0 ? chartCompactPercentFormatter.format(discountShare * 100) + '\u00A0%' : '0\u00A0%';
              var discountLabel = document.createElement('span');
              discountLabel.className = labelClass;
              discountLabel.textContent = 'Rabatt: – ' + formatter.format(data.discountValue) + ' (' + discountPercentText + ')';

              var discountTrack = document.createElement('div');
              discountTrack.className = trackClass;
              var discountFill = document.createElement('span');
              discountFill.className = fillClass;
              discountFill.setAttribute('aria-hidden', 'true');
              discountFill.style.width = discountWidth + '%';

              var discountAriaPercent = safeTotal > 0 ? chartCompactPercentFormatter.format(discountShare * 100) + ' %' : '0 %';
              discountBar.setAttribute('aria-label', 'Rabatt: – ' + formatter.format(data.discountValue) + ' (' + discountAriaPercent + ')');

              discountTrack.appendChild(discountFill);
              discountBar.appendChild(discountLabel);
              discountBar.appendChild(discountTrack);
              container.appendChild(discountBar);
            }
          }

          function renderResultChart(state) {
            if (!resultChartSection || !resultChartBars) {
              return;
            }

            var data = getCostChartData(state);

            if (!data.hasData) {
              resultChartSection.hidden = true;
              resultChartSection.setAttribute('aria-hidden', 'true');
              return;
            }

            resultChartSection.hidden = false;
            if (resultChartToggle) {
              setChartVisibility(resultChartToggle.checked);
            } else {
              resultChartSection.classList.remove('is-collapsed');
              resultChartSection.setAttribute('aria-hidden', 'false');
            }

            if (chartNetTotalOutput) {
              chartNetTotalOutput.textContent = 'Gesamtkosten (netto): ' + formatter.format(state.net);
            }

            renderCostBars(resultChartBars, data, {
              barClass: 'result-bar',
              labelClass: 'result-bar__label',
              trackClass: 'result-bar__track',
              fillClass: 'result-bar__fill',
              discountClass: 'result-bar--discount'
            });
          }

          function updatePrintSummary(state) {
            if (!printMaterialOutput) {
              return;
            }

            updatePrintOffer(state.offer);

            if (printHeaderPartName) {
              if (state.hasPartName) {
                printHeaderPartName.hidden = false;
                if (printHeaderPartNameValue) {
                  printHeaderPartNameValue.textContent = state.partName;
                }
              } else {
                printHeaderPartName.hidden = true;
                if (printHeaderPartNameValue) {
                  printHeaderPartNameValue.textContent = '';
                }
              }
            }

            if (printInputsPartName) {
              if (state.hasPartName) {
                printInputsPartName.hidden = false;
                if (printInputsPartNameValue) {
                  printInputsPartNameValue.textContent = state.partName;
                }
              } else {
                printInputsPartName.hidden = true;
                if (printInputsPartNameValue) {
                  printInputsPartNameValue.textContent = '';
                }
              }
            }

            printMaterialOutput.textContent = state.materialLabel;
            printMaterialPriceOutput.textContent = decimalFormatter.format(state.pricePerKg) + '\u00A0€/kg';
            printModeOutput.textContent = state.modeLabel;

            printWeightOutput.textContent = integerFormatter.format(state.weight) + '\u00A0g';
            printLengthOutput.textContent = decimalFormatter.format(state.length) + '\u00A0m';
            printTimeOutput.textContent = formatMinutesDisplay(state.hours * 60);
            printPowerOutput.textContent = integerFormatter.format(state.power) + '\u00A0W';
            printEnergyPriceOutput.textContent = decimalFormatter.format(state.energyPrice) + '\u00A0€/kWh';
            printLoadFactorOutput.textContent = integerFormatter.format(state.loadFactor) + '\u00A0%';
            printWastePercentOutput.textContent = percentNumberFormatter.format(state.pro.wastePercent) + '\u00A0%';

            setRowVisibility(printInputRows.weight, !!state.inputs.weight);
            setRowVisibility(printInputRows.length, !!state.inputs.length);
            setRowVisibility(printInputRows.duration, !!state.inputs.duration);
            setRowVisibility(printInputRows.power, !!state.inputs.power);
            setRowVisibility(printInputRows.energyPrice, !!state.inputs.energyPrice);
            setRowVisibility(printInputRows.loadFactor, !!state.inputs.loadFactor);
            setRowVisibility(printInputRows.wastePercent, !!state.inputs.wastePercent);

            if (printMaterialTotalOutput) {
              printMaterialTotalOutput.textContent = formatter.format(state.pro.materialTotal);
            }
            if (printEnergyCostOutput) {
              printEnergyCostOutput.textContent = formatter.format(state.energyCost);
            }
            if (printTimeCostOutput) {
              printTimeCostOutput.textContent = formatter.format(state.pro.timeCost);
            }
            if (printMachineCostOutput) {
              printMachineCostOutput.textContent = formatter.format(state.pro.machineCost);
            }
            if (printFixedCostOutput) {
              printFixedCostOutput.textContent = formatter.format(state.pro.fixedCost);
            }
            if (printPackagingCostOutput) {
              printPackagingCostOutput.textContent = formatter.format(state.pro.packagingCost);
            }
            if (printShippingCostOutput) {
              printShippingCostOutput.textContent = formatter.format(state.pro.shippingCost);
            }
            if (printMachineHourlyOutput) {
              printMachineHourlyOutput.textContent = formatter.format(state.pro.machineHourly) + '/h';
            }
            if (printMachinePurchaseOutput) {
              printMachinePurchaseOutput.textContent = formatter.format(state.pro.machinePurchase);
            }
            if (printMachineLifetimeOutput) {
              printMachineLifetimeOutput.textContent = integerFormatter.format(state.pro.machineLifetime) + '\u00A0h';
            }
            if (printMaterialDensityOutput) {
              printMaterialDensityOutput.textContent = decimalFormatter.format(state.pro.materialDensity) + '\u00A0g/cm³';
            }
            if (printErrorRateOutput) {
              printErrorRateOutput.textContent = percentNumberFormatter.format(state.pro.materialErrorPercent) + '\u00A0%';
            }
            if (printSubtotalOutput) {
              var subtotalValue = state.pro.enabled ? state.pro.subtotal : state.standardSubtotal;
              printSubtotalOutput.textContent = formatter.format(subtotalValue);
            }
            if (printMarginOutput) {
              printMarginOutput.textContent = formatter.format(state.pro.marginValue);
            }
            if (printDiscountOutput) {
              var discountText = hasValue(state.pro.discountValue)
                ? '– ' + formatter.format(state.pro.discountValue)
                : formatter.format(state.pro.discountValue);
              printDiscountOutput.textContent = discountText;
            }

            setRowVisibility(printSummaryItemTime, state.pro.enabled && hasValue(state.pro.timeCost));
            setRowVisibility(printSummaryItemMachine, state.pro.enabled && hasValue(state.pro.machineCost));
            setRowVisibility(printSummaryItemFixed, state.pro.enabled && hasValue(state.pro.fixedCost));
            setRowVisibility(printSummaryItemMargin, state.pro.enabled && hasValue(state.pro.marginValue));
            setRowVisibility(printSummaryItemDiscount, state.pro.enabled && hasValue(state.pro.discountValue));

            printNetOutput.textContent = formatter.format(state.net);
            printGrossOutput.textContent = formatter.format(state.gross);

            var highlightValue = state.vatIncluded ? state.gross : state.net;
            printTotalOutput.textContent = formatter.format(highlightValue);

            if (printTotalContextOutput) {
              printTotalContextOutput.textContent = state.vatIncluded ? ' (inkl. MwSt.)' : ' (netto)';
            }

            if (state.vatIncluded) {
              printVatNoteOutput.textContent = 'Preise inkl. MwSt. (19\u00A0%)';
            } else {
              printVatNoteOutput.textContent = 'Hinweis: §19 UStG – keine Umsatzsteuer.';
            }

            if (printProParamsSection) {
              var proVisibility = {
                profitMargin: state.inputs.profitMargin,
                hourlyRate: state.inputs.hourlyRate,
                setupMinutes: state.inputs.setupMinutes,
                printMinutes: state.inputs.printMinutes,
                finishingMinutes: state.inputs.finishingMinutes,
                fixedCost: state.inputs.fixedCost,
                discountPercent: state.inputs.discountPercent,
                errorRate: state.inputs.errorRate,
                packagingCost: state.inputs.packagingCost,
                shippingCost: state.inputs.shippingCost,
                machineHourlyRate: state.inputs.machineHourlyRate,
                machinePurchase: state.inputs.machinePurchase,
                machineLifetime: state.inputs.machineLifetime,
                materialDensity: state.inputs.materialDensity
              };

              if (state.pro.enabled) {
                printProfitMarginOutput.textContent = percentNumberFormatter.format(state.pro.profitMargin) + '\u00A0%';
                printHourlyRateOutput.textContent = formatter.format(state.pro.hourlyRate) + '/h';
                printSetupMinutesOutput.textContent = integerFormatter.format(state.pro.setupMinutes) + '\u00A0min';
                printProPrintMinutesOutput.textContent = integerFormatter.format(state.pro.printMinutes) + '\u00A0min';
                printFinishingMinutesOutput.textContent = integerFormatter.format(state.pro.finishingMinutes) + '\u00A0min';
                printFixedCostInputOutput.textContent = formatter.format(state.pro.fixedCostBase);
                printDiscountPercentOutput.textContent = percentNumberFormatter.format(state.pro.discountPercent) + '\u00A0%';
                if (printErrorRateOutput) {
                  printErrorRateOutput.textContent = percentNumberFormatter.format(state.pro.materialErrorPercent) + '\u00A0%';
                }
                if (printPackagingCostOutput) {
                  printPackagingCostOutput.textContent = formatter.format(state.pro.packagingCost);
                }
                if (printShippingCostOutput) {
                  printShippingCostOutput.textContent = formatter.format(state.pro.shippingCost);
                }
                if (printMachineHourlyOutput) {
                  printMachineHourlyOutput.textContent = formatter.format(state.pro.machineHourly) + '/h';
                }
                if (printMachinePurchaseOutput) {
                  printMachinePurchaseOutput.textContent = formatter.format(state.pro.machinePurchase);
                }
                if (printMachineLifetimeOutput) {
                  printMachineLifetimeOutput.textContent = integerFormatter.format(state.pro.machineLifetime) + '\u00A0h';
                }
                if (printMaterialDensityOutput) {
                  printMaterialDensityOutput.textContent = decimalFormatter.format(state.pro.materialDensity) + '\u00A0g/cm³';
                }

                setRowVisibility(printProInputRows.profitMargin, !!proVisibility.profitMargin);
                setRowVisibility(printProInputRows.hourlyRate, !!proVisibility.hourlyRate);
                setRowVisibility(printProInputRows.setupMinutes, !!proVisibility.setupMinutes);
                setRowVisibility(printProInputRows.printMinutes, !!proVisibility.printMinutes);
                setRowVisibility(printProInputRows.finishingMinutes, !!proVisibility.finishingMinutes);
                setRowVisibility(printProInputRows.fixedCost, !!proVisibility.fixedCost);
                setRowVisibility(printProInputRows.discountPercent, !!proVisibility.discountPercent);
                setRowVisibility(printProInputRows.errorRate, !!proVisibility.errorRate);
                setRowVisibility(printProInputRows.packagingCost, !!proVisibility.packagingCost);
                setRowVisibility(printProInputRows.shippingCost, !!proVisibility.shippingCost);
                setRowVisibility(printProInputRows.machineHourlyRate, !!proVisibility.machineHourlyRate);
                setRowVisibility(printProInputRows.machinePurchase, !!proVisibility.machinePurchase);
                setRowVisibility(printProInputRows.machineLifetime, !!proVisibility.machineLifetime);
                setRowVisibility(printProInputRows.materialDensity, !!proVisibility.materialDensity);

                var hasVisibleProRow = Object.keys(proVisibility).some(function (key) {
                  return !!proVisibility[key];
                });
                printProParamsSection.hidden = !hasVisibleProRow;
              } else {
                printProParamsSection.hidden = true;
              }
            }

            var chartData = getCostChartData(state);
            var shouldShowChart = state.chartEnabled && chartData.hasData;
            if (printResultGrid) {
              if (shouldShowChart) {
                printResultGrid.classList.remove('calc-print__result-grid--single');
              } else {
                printResultGrid.classList.add('calc-print__result-grid--single');
              }
            }

            if (printChartSection && printChartBarsOutput) {
              if (!shouldShowChart) {
                printChartSection.hidden = true;
                printChartSection.setAttribute('aria-hidden', 'true');
                if (printChartNoteOutput) {
                  printChartNoteOutput.textContent = '';
                }
              } else {
                printChartSection.hidden = false;
                printChartSection.setAttribute('aria-hidden', 'false');
                renderCostBars(printChartBarsOutput, chartData, {
                  barClass: 'calc-print__bar',
                  labelClass: 'calc-print__bar-label',
                  trackClass: 'calc-print__bar-track',
                  fillClass: 'calc-print__bar-fill',
                  discountClass: 'calc-print__bar--discount'
                });
                if (printChartNoteOutput) {
                  printChartNoteOutput.textContent = 'Gesamtkosten (netto): ' + formatter.format(state.net);
                }
              }
            }
          }

          function recalculate() {
            var state = computeState();
            updateResults(state);
            updatePrintSummary(state);
            return state;
          }

          initializeOfferSection();
          wireInputs();

          materialSelect.addEventListener('change', setMaterialDefaults);
          weightMode.addEventListener('change', updateModeVisibility);
          lengthMode.addEventListener('change', updateModeVisibility);

          attachRecalcListeners(pricePerKgInput, {
            onInput: function () {
              if (!pricePerKgProgrammatic) {
                var valueRaw = pricePerKgInput.value != null ? pricePerKgInput.value.toString().trim() : '';
                pricePerKgUserEdited = valueRaw.length > 0;
              }
              var currentDefaults = materialSelect ? materialData[materialSelect.value] || {} : {};
              updateMaterialSuggestionState(currentDefaults);
            },
            onChange: function () {
              if (!pricePerKgProgrammatic) {
                var valueRaw = pricePerKgInput.value != null ? pricePerKgInput.value.toString().trim() : '';
                pricePerKgUserEdited = valueRaw.length > 0;
              }
              var currentDefaults = materialSelect ? materialData[materialSelect.value] || {} : {};
              updateMaterialSuggestionState(currentDefaults);
            }
          });

          [weightInput, lengthInput, powerInput, energyPriceInput, loadFactorInput, wastePercentInput, partNameInput].forEach(function (input) {
            attachRecalcListeners(input);
          });

          attachRecalcListeners(timeInput);

          if (priceSuggestionButton) {
            priceSuggestionButton.addEventListener('click', function () {
              if (!materialSelect || !pricePerKgInput) {
                return;
              }

              var defaults = materialData[materialSelect.value] || {};
              var hasPrice = typeof defaults.price === 'number' && isFinite(defaults.price);
              var hasDensity = typeof defaults.density === 'number' && isFinite(defaults.density);
              if (!hasPrice && !hasDensity) {
                return;
              }

              if (hasPrice) {
                pricePerKgProgrammatic = true;
                pricePerKgInput.value = defaults.price.toString();
                pricePerKgProgrammatic = false;
                pricePerKgUserEdited = false;
              }

              if (hasDensity && materialDensityInput) {
                materialDensityProgrammatic = true;
                materialDensityInput.value = defaults.density.toFixed(2);
                materialDensityProgrammatic = false;
                materialDensityUserEdited = false;
                materialDensityInput.removeAttribute('data-user-set');
              }

              updateMaterialSuggestionState(defaults);
              triggerRecalc({ immediate: true });

              pricePerKgInput.focus();
            });
          }

          if (materialDensityResetButton && materialDensityInput) {
            materialDensityResetButton.addEventListener('click', function () {
              var defaults = currentMaterialDefaults || {};
              var hasDensity = typeof defaults.density === 'number' && isFinite(defaults.density);
              materialDensityProgrammatic = true;
              if (hasDensity) {
                materialDensityInput.value = defaults.density.toFixed(2);
              } else {
                materialDensityInput.value = '';
              }
              materialDensityProgrammatic = false;
              materialDensityUserEdited = false;
              materialDensityInput.removeAttribute('data-user-set');
              updateMaterialSuggestionState(defaults);
              triggerRecalc({ immediate: true });
              if (proModeEnabled && !materialDensityInput.disabled) {
                materialDensityInput.focus();
              }
            });
          }

          if (printResultButton) {
            printResultButton.addEventListener('click', function () {
              exportPdf('result');
            });
          }

          if (printFullButton) {
            printFullButton.addEventListener('click', function () {
              exportPdf('full');
            });
          }

          if (proToggle) {
            proToggle.addEventListener('change', function () {
              setProState(proToggle.checked);
            });
          }

          if (proCollapseToggle) {
            proCollapseToggle.addEventListener('click', function () {
              if (!proModeEnabled) {
                return;
              }
              setProCardCollapsedState(!proCardCollapsed);
            });
          }

          [
            profitMarginInput,
            hourlyRateInput,
            setupMinutesInput,
            finishingMinutesInput,
            fixedCostInput,
            discountPercentInput,
            errorRateInput,
            packagingCostInput,
            shippingCostInput,
            machinePurchaseInput,
            machineLifetimeInput
          ].forEach(function (input) {
            attachRecalcListeners(input);
          });

          attachRecalcListeners(machineHourlyInput, {
            onInput: function () {
              if (!machineHourlyProgrammatic) {
                var valueRaw = machineHourlyInput.value != null ? machineHourlyInput.value.toString().trim() : '';
                machineHourlyUserEdited = valueRaw.length > 0;
              }
            },
            onChange: function () {
              if (!machineHourlyProgrammatic) {
                var valueRaw = machineHourlyInput.value != null ? machineHourlyInput.value.toString().trim() : '';
                machineHourlyUserEdited = valueRaw.length > 0;
              }
            }
          });
          attachRecalcListeners(materialDensityInput, {
            onInput: function () {
              if (!materialDensityProgrammatic) {
                var valueRaw = materialDensityInput.value != null ? materialDensityInput.value.toString().trim() : '';
                materialDensityUserEdited = valueRaw.length > 0;
                if (materialDensityUserEdited) {
                  materialDensityInput.setAttribute('data-user-set', '1');
                } else {
                  materialDensityInput.removeAttribute('data-user-set');
                }
              }
              updateMaterialSuggestionState(currentMaterialDefaults);
            },
            onChange: function () {
              if (!materialDensityProgrammatic) {
                var valueRaw = materialDensityInput.value != null ? materialDensityInput.value.toString().trim() : '';
                materialDensityUserEdited = valueRaw.length > 0;
                if (materialDensityUserEdited) {
                  materialDensityInput.setAttribute('data-user-set', '1');
                } else {
                  materialDensityInput.removeAttribute('data-user-set');
                }
              }
              updateMaterialSuggestionState(currentMaterialDefaults);
            }
          });

          if (proPrintMinutesInput) {
            ['input', 'change', 'blur'].forEach(function (eventName) {
              proPrintMinutesInput.addEventListener(eventName, updateTimeFromProMinutes);
            });
          }

          window.addEventListener('beforeprint', function () {
            recalculate();
          });

          window.addEventListener('afterprint', function () {
            setPrintAttribute(null);
            if (pendingPrintTitle !== null) {
              document.title = originalDocumentTitle;
              pendingPrintTitle = null;
            }
          });

          setMaterialDefaults();
          updateModeVisibility();
          setProState(proToggle ? proToggle.checked : false);
          recalculate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCalc, { once: true });
  } else {
    initCalc();
  }
})();
