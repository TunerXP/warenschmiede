(function () {
  function qsa(sel, root) {
    var context = root || document;
    return Array.prototype.slice.call(context.querySelectorAll(sel));
  }

  function initCalc() {
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
          var proToggle = document.getElementById('proToggle');
          var proFields = document.getElementById('pro-fields');
          var proCard = document.getElementById('proCard');
          var proPane = document.querySelector('[data-pro-pane]');
          var proCardBody = document.getElementById('proCardBody');
          var proCollapseToggle = document.getElementById('proCollapseToggle');
          var proRows = document.querySelectorAll('[data-pro-row="true"]');
          var rootElement = document.documentElement;
          var calcFields = qsa('[data-calc], [data-calc-pro]');
          var suppressCalcEvent = false;
          var profitMarginInput = document.getElementById('profitMargin');
          var hourlyRateInput = document.getElementById('hourlyRate');
          var setupMinutesInput = document.getElementById('setupMinutes');
          var proPrintMinutesInput = document.getElementById('proPrintMinutes');
          var finishingMinutesInput = document.getElementById('finishingMinutes');
          var wastePercentInput = document.getElementById('wastePercent');
          var fixedCostInput = document.getElementById('fixedCost');
          var discountPercentInput = document.getElementById('discountPercent');
          var partNameInput = document.getElementById('partName');

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
          var printTimestampOutput = document.getElementById('printTimestamp');
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
          var FILAMENT_DIAMETER_MM = 1.75;

          var chartCollapseMediaQuery = window.matchMedia('(max-width: 359px)');
          var chartToggleInteracted = false;
          var proCardMediaQuery = window.matchMedia('(max-width: 1099px)');
          var proCardCollapsed = false;

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
          var dateTimeFormatter = new Intl.DateTimeFormat('de-DE', { dateStyle: 'short', timeStyle: 'short' });

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
              recalc();
            }
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

          function buildPrintFileName(mode, state) {
            var normalizedPart = normalizeFileNamePart(state.partName);
            var datePart = formatDateForFile(new Date());
            var prefix = mode === 'full' ? 'Kostenblatt_Eingaben' : 'Kostenblatt';
            var nameParts = [prefix];
            if (mode === 'full') {
              nameParts.push(normalizedPart);
            } else {
              nameParts.push(normalizedPart);
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

          function num(value) {
            var normalized = parseFloat(String(value == null ? '' : value).replace(',', '.'));
            return Number.isFinite(normalized) ? normalized : 0;
          }

          function readNumber(input) {
            if (!input) return 0;
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
            } else {
              input.disabled = true;
              input.setAttribute('aria-disabled', 'true');
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

          function updatePrintTimestamp() {
            if (printTimestampOutput) {
              printTimestampOutput.textContent = dateTimeFormatter.format(new Date());
            }
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
            recalc();
          }, recalcThrottleDelay);

          function triggerRecalc(options) {
            if (options && options.immediate) {
              recalc();
            } else {
              queueRecalc();
            }
          }

          function triggerPrint(mode) {
            setPrintAttribute(mode);
            updatePrintTimestamp();
            var state = recalc();
            if (state) {
              var fileTitle = buildPrintFileName(mode, state);
              pendingPrintTitle = fileTitle;
              document.title = fileTitle;
            }
            window.print();
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
            recalc();
          }

          function computeState() {
            var partNameRaw = getInputRaw(partNameInput);
            var partNameTrimmed = partNameRaw ? partNameRaw.trim() : '';
            if (partNameTrimmed.length > 80) {
              partNameTrimmed = partNameTrimmed.slice(0, 80);
            }
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
              inputs: inputVisibility
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

          function recalc() {
            var state = computeState();
            updateResults(state);
            updatePrintSummary(state);
            return state;
          }

          calcFields.forEach(function (field) {
            field.addEventListener('input', handleCalcInputEvent);
            field.addEventListener('change', handleCalcChangeEvent);
          });

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
              updateMaterialSuggestionState(defaults);
              triggerRecalc({ immediate: true });
              if (proModeEnabled && !materialDensityInput.disabled) {
                materialDensityInput.focus();
              }
            });
          }

          if (printResultButton) {
            printResultButton.addEventListener('click', function () {
              triggerPrint('result');
            });
          }

          if (printFullButton) {
            printFullButton.addEventListener('click', function () {
              triggerPrint('full');
            });
          }

          setProModeEnabled(proToggle ? proToggle.checked : false, { skipRecalc: true });

          if (proToggle) {
            proToggle.addEventListener('change', function () {
              setProModeEnabled(proToggle.checked);
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
              }
              updateMaterialSuggestionState(currentMaterialDefaults);
            },
            onChange: function () {
              if (!materialDensityProgrammatic) {
                var valueRaw = materialDensityInput.value != null ? materialDensityInput.value.toString().trim() : '';
                materialDensityUserEdited = valueRaw.length > 0;
              }
              updateMaterialSuggestionState(currentMaterialDefaults);
            }
          });

          if (proPrintMinutesInput) {
            ['input', 'change', 'blur'].forEach(function (eventName) {
              proPrintMinutesInput.addEventListener(eventName, updateTimeFromProMinutes);
            });
          }

          updatePrintTimestamp();
          window.addEventListener('beforeprint', function () {
            updatePrintTimestamp();
            recalc();
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
          recalc();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCalc, { once: true });
  } else {
    initCalc();
  }
})();
