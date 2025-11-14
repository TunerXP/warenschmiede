(function () {
  var $$ = function (sel, root) {
    var context = root || document;
    return Array.prototype.slice.call(context.querySelectorAll(sel));
  };

  var num = function (value) {
    var normalized = parseFloat(String(value == null ? '' : value).replace(',', '.'));
    return Number.isFinite(normalized) ? normalized : 0;
  };

  var createDebounce = function (callback, delay) {
    var timeoutId = null;
    var wait = typeof delay === 'number' && delay >= 0 ? delay : 0;
    return function () {
      var args = arguments;
      var context = this;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(function () {
        timeoutId = null;
        callback.apply(context, args);
      }, wait);
    };
  };

  var PRINT_STORAGE_PREFIX = 'ws:print:';
  var PRINT_STORAGE_PARAM = 'k';

  function safeStorage(type) {
    try {
      var storage = window[type];
      if (!storage) {
        return null;
      }
      var testKey = '__ws_print_test__' + Math.random().toString(16).slice(2);
      storage.setItem(testKey, '1');
      storage.removeItem(testKey);
      return storage;
    } catch (error) {
      return null;
    }
  }

  var buildOfferUrl = function () { return ''; };
  var buildInvoiceUrl = function () { return ''; };

  document.addEventListener('DOMContentLoaded', function () {
    var byId = function (id) {
      return /** @type {HTMLButtonElement|null} */ (document.getElementById(id));
    };
    var offer = byId('btnOffer');
    var invoice = byId('btnInvoice');

    function navigateToPrintPage(target) {
      var url = '';
      if (target === 'offer') {
        url = buildOfferUrl();
      } else if (target === 'invoice') {
        url = buildInvoiceUrl();
      }
      if (!url) {
        return;
      }
      window.location.href = url;
    }

    function attachPrintHandler(button, target) {
      if (!button || !target) {
        return;
      }
      if (button.dataset.printBound === '1') {
        return;
      }
      button.dataset.printBound = '1';
      button.addEventListener('click', function () {
        navigateToPrintPage(target);
      });
    }

    attachPrintHandler(offer, 'offer');
    attachPrintHandler(invoice, 'invoice');
  });

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
          var vatNoteOutput = document.getElementById('vatNote');
          var resultChartSection = document.getElementById('resultChart');
          var resultChartBars = document.getElementById('resultChartBars');
          var resultChartToggle = document.getElementById('resultChartToggle');
          var chartNetTotalOutput = document.getElementById('chartNetTotal');
          var proStatusOutput = document.getElementById('proStatus');
          var printOfferButton = document.getElementById('btnOffer');
          var printInvoiceButton = document.getElementById('btnInvoice');
          var markInvoicePaidCheckbox = document.getElementById('markInvoicePaid');
          var paidDateInput = document.getElementById('paidDate');
          var invoiceErrorOutput = document.getElementById('invoiceError');
          var invoiceNumberInput = document.getElementById('invoiceNumber');
          var invoiceDateInput = document.getElementById('invoiceDate');
          var serviceDateInput = document.getElementById('serviceDate');
          var offerNoteInput = document.getElementById('offerNote');
          var invoiceNoteInput = document.getElementById('invoiceNote');
          var proFields = document.getElementById('pro-fields');
          var proCard = document.getElementById('proCard');
          var proCardBody = document.getElementById('proCardBody');
          var proCollapseToggle = document.getElementById('proCollapseToggle');
          var proRows = document.querySelectorAll('[data-pro-row="true"]');
          var rememberStandardToggle = document.getElementById('rememberStandard');
          var rememberProToggle = document.getElementById('rememberPro');
          var rememberSellerToggle = document.getElementById('offerRememberSeller');
          var rememberCustomerToggle = document.getElementById('offerRememberCustomer');
          var rootElement = document.documentElement;
          var bodyElement = document.body;
          var shareButton = document.querySelector('[data-share-trigger]');
          var shareMessage = document.querySelector('[data-share-message]');
          var shareMessageTimer = null;
          var toastElement = document.querySelector('[data-calc-toast]');
          var toastTimer = null;
          var toastHideTimer = null;
          var saveButtons = $$('#btnSaveTop,#btnSaveBottom');
          var loadButtons = $$('#btnLoadTop,#btnLoadBottom');
          var fileLoadInput = document.getElementById('fileLoad');

          function clearShareMessageTimer() {
            if (shareMessageTimer) {
              clearTimeout(shareMessageTimer);
              shareMessageTimer = null;
            }
          }

          function showShareMessage(text) {
            if (!shareMessage) {
              return;
            }
            clearShareMessageTimer();
            shareMessage.textContent = text;
            shareMessage.classList.add('is-visible');
            shareMessageTimer = setTimeout(function () {
              shareMessage.classList.remove('is-visible');
              shareMessageTimer = null;
            }, 4200);
          }

          function clearToastTimers() {
            if (toastTimer) {
              clearTimeout(toastTimer);
              toastTimer = null;
            }
            if (toastHideTimer) {
              clearTimeout(toastHideTimer);
              toastHideTimer = null;
            }
          }

          function hideToastMessage() {
            if (!toastElement) {
              return;
            }
            if (toastTimer) {
              clearTimeout(toastTimer);
              toastTimer = null;
            }
            toastElement.classList.remove('is-visible');
            toastElement.setAttribute('aria-hidden', 'true');
            toastHideTimer = setTimeout(function () {
              if (toastElement) {
                toastElement.hidden = true;
              }
              toastHideTimer = null;
            }, 260);
          }

          function showToastMessage(text) {
            if (!toastElement) {
              if (text) {
                window.alert(text);
              }
              return;
            }
            clearToastTimers();
            toastElement.textContent = text || '';
            toastElement.hidden = false;
            toastElement.setAttribute('aria-hidden', 'false');
            toastElement.classList.add('is-visible');
            toastTimer = setTimeout(function () {
              hideToastMessage();
            }, 4200);
          }

          function fallbackCopyUsingTextArea(text) {
            return new Promise(function (resolve, reject) {
              var textArea = document.createElement('textarea');
              textArea.value = text;
              textArea.setAttribute('readonly', '');
              textArea.style.position = 'fixed';
              textArea.style.top = '-9999px';
              textArea.style.left = '-9999px';
              textArea.style.opacity = '0';
              document.body.appendChild(textArea);
              var selection = document.getSelection ? document.getSelection() : null;
              var selectedRange = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
              textArea.focus();
              textArea.select();
              textArea.setSelectionRange(0, textArea.value.length);
              var succeeded = false;
              var error = null;
              try {
                succeeded = document.execCommand('copy');
              } catch (copyError) {
                error = copyError;
              }
              document.body.removeChild(textArea);
              if (selectedRange && selection) {
                selection.removeAllRanges();
                selection.addRange(selectedRange);
              }
              if (succeeded) {
                resolve();
              } else {
                reject(error || new Error('copy command unsuccessful'));
              }
            });
          }

          function copyShareLink(url) {
            return new Promise(function (resolve, reject) {
              if (!url) {
                reject(new Error('Missing share URL'));
                return;
              }
              if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
                navigator.clipboard.writeText(url).then(resolve, function () {
                  fallbackCopyUsingTextArea(url).then(resolve, reject);
                });
              } else {
                fallbackCopyUsingTextArea(url).then(resolve, reject);
              }
            });
          }

          if (shareButton) {
            shareButton.addEventListener('click', function (event) {
              event.preventDefault();
              var trigger = event.currentTarget || shareButton;
              var shareUrl = trigger.getAttribute('data-share-url') || window.location.href;
              var shareTitle = trigger.getAttribute('data-share-title') || document.title;
              var shareText = trigger.getAttribute('data-share-text') || '';
              var successMessage = trigger.getAttribute('data-share-success') || 'Link kopiert.';
              if (navigator.share && typeof navigator.share === 'function') {
                try {
                  navigator.share({ title: shareTitle, text: shareText, url: shareUrl }).catch(function (shareError) {
                    if (!shareError) {
                      return;
                    }
                    if (shareError.name === 'AbortError' || shareError.name === 'NotAllowedError') {
                      return;
                    }
                  });
                } catch (error) {}
              }
              copyShareLink(shareUrl).then(function () {
                showShareMessage(successMessage);
              }, function () {
                showShareMessage('Link konnte nicht automatisch kopiert werden. Bitte kopiere ihn manuell aus der Adresszeile.');
              });
            });
          }

          if (resultBox) {
            resultBox.dataset.ready = 'true';
          }
          var suppressCalcEvent = false;
          var lastValidState = null;
          var profitMarginInput = document.getElementById('profitMargin');
          var hourlyRateInput = document.getElementById('hourlyRate');
          var setupMinutesInput = document.getElementById('setupMinutes');
          var proPrintMinutesInput = document.getElementById('proPrintMinutes');
          var finishingMinutesInput = document.getElementById('finishingMinutes');
          var wastePercentInput = document.getElementById('wastePercent');
          var fixedCostInput = document.getElementById('fixedCost');
          var discountPercentInput = document.getElementById('discountPercent');
          var errorRateInput = document.getElementById('errorRate');
          var discountErrorOutput = document.getElementById('discountError');
          var packagingCostInput = document.getElementById('packagingCost');
          var shippingCostInput = document.getElementById('shippingCost');
          var machineHourlyInput = document.getElementById('machineHourlyRate');
          var machinePurchaseInput = document.getElementById('machinePurchase');
          var machineLifetimeInput = document.getElementById('machineLifetime');
          var machineAutoHint = document.getElementById('machineAutoHint');
          var materialDensityInput = document.getElementById('proDensity');
          var nozzleDiameterSelect = document.getElementById('nozzleDiameter');
          var nozzleTypeSelect = document.getElementById('nozzleType');
          var nozzleDiameterError = document.getElementById('nozzleDiameterError');
          var nozzleTypeError = document.getElementById('nozzleTypeError');
          var proNoteInput = document.getElementById('proNote');
          var partNameInput = document.getElementById('partName');
          var offerFields = $$('[data-offer-field]');
          var calcInputs = $$('[data-calc]');
          var proCalcInputs = $$('[data-calc-pro]');
          var offerFieldMap = {};
          offerFields.forEach(function (field) {
            var key = field.getAttribute('data-offer-field');
            if (key) {
              offerFieldMap[key] = field;
            }
          });
          var sellerFieldElements = offerFields.filter(function (field) {
            var key = field.getAttribute('data-offer-field') || '';
            return /^vendor/i.test(key) || /^offer/i.test(key) || /^invoice/i.test(key);
          });
          var customerFieldElements = offerFields.filter(function (field) {
            var key = field.getAttribute('data-offer-field') || '';
            return /^customer/i.test(key);
          });
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
            vendorIban: findOfferPrintRow('vendorIban', 'printOfferVendorIban'),
            vendorBic: findOfferPrintRow('vendorBic', 'printOfferVendorBic'),
            vendorBankName: findOfferPrintRow('vendorBankName', 'printOfferVendorBank'),
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
          var printInvoiceMetaContainer = document.querySelector('.calc-print__invoice-meta');
          var printInvoiceMetaItems = {
            number: document.querySelector('[data-invoice-meta="number"]'),
            date: document.querySelector('[data-invoice-meta="date"]'),
            service: document.querySelector('[data-invoice-meta="service"]')
          };
          var printInvoiceMetaValues = {
            number: document.getElementById('printInvoiceNumber'),
            date: document.getElementById('printInvoiceDate'),
            service: document.getElementById('printServiceDate')
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
          var printAdjustmentsGroup = document.querySelector('[data-print-group="adjustments"]');
          var printAdjustmentsSeparator = document.querySelector('[data-print-separator="after-adjustments"]');
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
          var printNozzleOutput = document.getElementById('printNozzle');
          var printTitleElement = document.querySelector('.calc-print__title');
          var printHeaderPartName = document.getElementById('printHeaderPartName');
          var printHeaderPartNameValue = document.getElementById('printHeaderPartNameValue');
          var printInputsPartName = document.getElementById('printInputsPartName');
          var printInputsPartNameValue = document.getElementById('printInputsPartNameValue');
          var printTotalContextOutput = document.getElementById('printTotalContext');
          var printChartSection = document.getElementById('printChartSection');
          var printChartBarsOutput = document.getElementById('printChartBars');
          var printChartNoteOutput = document.getElementById('printChartTotal');
          var printNoteCard = document.getElementById('printNoteCard');
          var printNoteValue = document.getElementById('printNoteValue');
          var printVatNoteOutput = document.getElementById('printVatNote');
          var printInputsSection = document.getElementById('printInputsSection');
          var printInputsTable = document.getElementById('printInputsTable');
          var printInputsContainer = printInputsSection || printInputsTable;
          var printProParamsSection = document.getElementById('printProParams');
          var printProfitMarginOutput = document.getElementById('printProfitMargin');
          var printHourlyRateOutput = document.getElementById('printHourlyRate');
          var printSetupMinutesOutput = document.getElementById('printSetupMinutes');
          var printProPrintMinutesOutput = document.getElementById('printProPrintMinutes');
          var printFinishingMinutesOutput = document.getElementById('printFinishingMinutes');
          var printWastePercentOutput = document.getElementById('printWastePercent');
          var printFixedCostInputOutput = document.getElementById('printFixedCostInput');
          var printDiscountPercentOutput = document.getElementById('printDiscountPercent');
          var printOfferNetValue = document.getElementById('printOfferNet');
          var printOfferVatValue = document.getElementById('printOfferVat');
          var printOfferVatRow = document.getElementById('printOfferVatRow');
          var printOfferGrossValue = document.getElementById('printOfferGross');
          var printOfferDeliveryInline = document.getElementById('printOfferDeliveryInline');
          var printOfferPaymentInline = document.getElementById('printOfferPaymentInline');
          var printOfferDescription = document.getElementById('printOfferDescription');
          var printOfferQuantity = document.getElementById('printOfferQuantity');
          var printOfferUnitPrice = document.getElementById('printOfferUnitPrice');
          var printOfferLineTotal = document.getElementById('printOfferLineTotal');
          var printOfferNoteCard = document.getElementById('printOfferNoteCard');
          var printOfferNoteValue = document.getElementById('printOfferNoteValue');
          var printInvoiceDescription = document.getElementById('printInvoiceDescription');
          var printInvoiceQuantity = document.getElementById('printInvoiceQuantity');
          var printInvoiceUnitPrice = document.getElementById('printInvoiceUnitPrice');
          var printInvoiceSubtotal = document.getElementById('printInvoiceSubtotal');
          var printInvoiceVat = document.getElementById('printInvoiceVat');
          var printInvoiceVatRow = document.getElementById('printInvoiceVatRow');
          var printInvoiceGross = document.getElementById('printInvoiceGross');
          var printInvoiceVatNote = document.getElementById('printInvoiceVatNote');
          var printInvoicePaymentContainer = document.getElementById('printInvoicePayment');
          var printInvoicePaidLine = document.getElementById('printInvoicePaidLine');
          var printInvoicePaidDate = document.getElementById('printInvoicePaidDate');
          var printInvoiceDueLine = document.getElementById('printInvoiceDueLine');
          var printInvoiceDueDate = document.getElementById('printInvoiceDueDate');
          var printInvoiceNoteCard = document.getElementById('printInvoiceNoteCard');
          var printInvoiceNoteValue = document.getElementById('printInvoiceNoteValue');
          var printInvoiceNetValue = document.getElementById('printInvoiceNet');
          var printFooterBrandElement = document.querySelector('#ws-print-footer .ws-brand');
          var defaultPrintFooterText = printFooterBrandElement ? printFooterBrandElement.textContent : '';
          var printInputRows = {
            weight: printInputsContainer ? printInputsContainer.querySelector('[data-input-row="weight"]') : null,
            length: printInputsContainer ? printInputsContainer.querySelector('[data-input-row="length"]') : null,
            duration: printInputsContainer ? printInputsContainer.querySelector('[data-input-row="duration"]') : null,
            power: printInputsContainer ? printInputsContainer.querySelector('[data-input-row="power"]') : null,
            energyPrice: printInputsContainer ? printInputsContainer.querySelector('[data-input-row="energyPrice"]') : null,
            loadFactor: printInputsContainer ? printInputsContainer.querySelector('[data-input-row="loadFactor"]') : null,
            wastePercent: printInputsContainer ? printInputsContainer.querySelector('[data-input-row="wastePercent"]') : null
          };
          var printProInputRows = {
            profitMargin: printInputsContainer ? printInputsContainer.querySelector('[data-input-row="profitMargin"]') : null,
            hourlyRate: printInputsContainer ? printInputsContainer.querySelector('[data-input-row="hourlyRate"]') : null,
            setupMinutes: printInputsContainer ? printInputsContainer.querySelector('[data-input-row="setupMinutes"]') : null,
            printMinutes: printInputsContainer ? printInputsContainer.querySelector('[data-input-row="printMinutes"]') : null,
            finishingMinutes: printInputsContainer ? printInputsContainer.querySelector('[data-input-row="finishingMinutes"]') : null,
            fixedCost: printInputsContainer ? printInputsContainer.querySelector('[data-input-row="fixedCost"]') : null,
            discountPercent: printInputsContainer ? printInputsContainer.querySelector('[data-input-row="discountPercent"]') : null,
            errorRate: printInputsContainer ? printInputsContainer.querySelector('[data-input-row="errorRate"]') : null,
            packagingCost: printInputsContainer ? printInputsContainer.querySelector('[data-input-row="packagingCost"]') : null,
            shippingCost: printInputsContainer ? printInputsContainer.querySelector('[data-input-row="shippingCost"]') : null,
            machineHourlyRate: printInputsContainer ? printInputsContainer.querySelector('[data-input-row="machineHourlyRate"]') : null,
            machinePurchase: printInputsContainer ? printInputsContainer.querySelector('[data-input-row="machinePurchase"]') : null,
            machineLifetime: printInputsContainer ? printInputsContainer.querySelector('[data-input-row="machineLifetime"]') : null,
            materialDensity: printInputsContainer ? printInputsContainer.querySelector('[data-input-row="materialDensity"]') : null,
            materialNozzle: printInputsContainer ? printInputsContainer.querySelector('[data-input-row="materialNozzle"]') : null
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
          var calcAppVersion = (function () {
            var heading = document.querySelector('.tool-title');
            if (heading && heading.textContent) {
              var match = heading.textContent.match(/v\s*([0-9]+\.[0-9]+\.[0-9]+)/i);
              if (match && match[1]) {
                return match[1];
              }
            }
            return '1.0.0';
          })();
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
          var OFFER_COUNTER_KEY = 'ws3d_offer_counter';
          var AUTOSAVE_STORAGE_KEY = 'ws:autosaves';
          var storageApi = window.wsStorage || null;
          var persistApi = window.wsPersist || null;
          var hasPersistApi = !!(persistApi && typeof persistApi.loadSection === 'function' && typeof persistApi.saveSection === 'function' && typeof persistApi.clearSection === 'function');
          var standardPersistence = null;
          var proPersistence = null;
          var sellerPersistence = null;
          var customerPersistence = null;
          var loadedStandardPayload = null;
          var loadedProPayload = null;
          var loadedSellerPayload = null;
          var loadedCustomerPayload = null;
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
            if (storageApi && typeof storageApi.get === 'function') {
              return storageApi.get(key);
            }
            try {
              return window.localStorage ? window.localStorage.getItem(key) : null;
            } catch (error) {
              return null;
            }
          }

          function setStorageItem(key, value) {
            if (storageApi && typeof storageApi.set === 'function') {
              storageApi.set(key, value);
              return;
            }
            try {
              if (window.localStorage) {
                window.localStorage.setItem(key, value);
              }
            } catch (error) {}
          }

          function removeStorageItem(key) {
            if (storageApi && typeof storageApi.remove === 'function') {
              storageApi.remove(key);
              return;
            }
            try {
              if (window.localStorage) {
                window.localStorage.removeItem(key);
              }
            } catch (error) {}
          }

          function createPersistenceController(sectionKey, config) {
            if (!sectionKey) {
              return null;
            }
            var cfg = config || {};
            var checkbox = cfg.checkbox || null;
            var collect = typeof cfg.collect === 'function' ? cfg.collect : function () { return {}; };
            var apply = typeof cfg.apply === 'function' ? cfg.apply : null;
            var onEnable = typeof cfg.onEnable === 'function' ? cfg.onEnable : null;
            var onClear = typeof cfg.onClear === 'function' ? cfg.onClear : null;
            var remember = false;
            var lastLoaded = null;
            var debouncedSave = createDebounce(function () {
              if (!remember || !hasPersistApi) {
                return;
              }
              var payload = collect();
              if (!payload || typeof payload !== 'object') {
                payload = {};
              }
              payload.remember = true;
              persistApi.saveSection(sectionKey, payload);
            }, 250);

            function saveImmediate(options) {
              if (!remember || !hasPersistApi) {
                return;
              }
              var payload = collect();
              if (!payload || typeof payload !== 'object') {
                payload = {};
              }
              payload.remember = true;
              persistApi.saveSection(sectionKey, payload);
              if (!options || !options.skipTrack) {
                lastLoaded = payload;
              }
            }

            function setRememberState(nextValue, options) {
              var opts = options || {};
              var next = !!nextValue;
              var previous = remember;
              remember = next;
              if (checkbox && checkbox.checked !== remember) {
                checkbox.checked = remember;
              }
              if (remember) {
                if (!opts.skipEnable && onEnable) {
                  onEnable();
                }
                if (!opts.skipSave) {
                  saveImmediate({ skipTrack: !!opts.skipTrack });
                }
              } else if (previous) {
                if (hasPersistApi) {
                  persistApi.clearSection(sectionKey);
                }
                lastLoaded = null;
                if (onClear) {
                  onClear();
                }
              }
            }

            if (checkbox) {
              checkbox.addEventListener('change', function () {
                if (checkbox.checked) {
                  setRememberState(true);
                } else {
                  setRememberState(false);
                }
              });
            }

            if (hasPersistApi) {
              var stored = persistApi.loadSection(sectionKey);
              if (stored && stored.remember === true) {
                remember = true;
                lastLoaded = stored;
                if (checkbox) {
                  checkbox.checked = true;
                }
                if (apply) {
                  apply(stored);
                }
              }
            }

            return {
              isRemembering: function () {
                return remember;
              },
              scheduleSave: function () {
                if (remember) {
                  debouncedSave();
                }
              },
              saveImmediate: saveImmediate,
              clear: function () {
                setRememberState(false);
              },
              setRemember: setRememberState,
              getLoaded: function () {
                return lastLoaded;
              }
            };
          }

          function isCustomerFieldKey(key) {
            return /^customer/i.test((key || '').toString());
          }

          function isSellerFieldKey(key) {
            if (!key) {
              return false;
            }
            if (isCustomerFieldKey(key)) {
              return false;
            }
            return /^vendor/i.test(key) || /^offer/i.test(key) || /^invoice/i.test(key);
          }

          function schedulePersistenceForTarget(target, immediate) {
            if (!target) {
              return;
            }
            var runImmediate = !!immediate;
            if (target.hasAttribute('data-calc') && standardPersistence) {
              if (runImmediate) {
                standardPersistence.saveImmediate();
              } else {
                standardPersistence.scheduleSave();
              }
            }
            if (target.hasAttribute('data-calc-pro') && proPersistence) {
              if (runImmediate) {
                proPersistence.saveImmediate();
              } else {
                proPersistence.scheduleSave();
              }
            }
            var offerKey = target.getAttribute('data-offer-field');
            if (offerKey) {
              if (isCustomerFieldKey(offerKey)) {
                if (customerPersistence) {
                  if (runImmediate) {
                    customerPersistence.saveImmediate();
                  } else {
                    customerPersistence.scheduleSave();
                  }
                }
              } else if (isSellerFieldKey(offerKey)) {
                if (sellerPersistence) {
                  if (runImmediate) {
                    sellerPersistence.saveImmediate();
                  } else {
                    sellerPersistence.scheduleSave();
                  }
                }
              }
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
              densityHint: 'Richtwert: 2,98\u00A0g/m · 1,24\u00A0g/cm³ (PLA). Der Wert steuert Materialgewicht und damit die Materialkosten.'
            },
            'PLA_PLUS': {
              price: 23,
              gramsPerMeter: 3.05,
              density: 1.27,
              densityHint: 'Richtwert: 3,05\u00A0g/m · 1,27\u00A0g/cm³ (PLA+). Der Wert steuert Materialgewicht und damit die Materialkosten.'
            },
            'PLA_SILK': {
              price: 25,
              gramsPerMeter: 2.90,
              density: 1.21,
              densityHint: 'Richtwert: 2,90\u00A0g/m · 1,21\u00A0g/cm³ (PLA Silk). Der Wert steuert Materialgewicht und damit die Materialkosten.'
            },
            'PETG': {
              price: 25,
              gramsPerMeter: 3.05,
              density: 1.27,
              densityHint: 'Richtwert: 3,05\u00A0g/m · 1,27\u00A0g/cm³ (PETG). Der Wert steuert Materialgewicht und damit die Materialkosten.'
            },
            'PETG_CF': {
              price: 55,
              gramsPerMeter: 3.20,
              density: 1.33,
              densityHint: 'Richtwert: 3,20\u00A0g/m · 1,33\u00A0g/cm³ (PETG-CF). Der Wert steuert Materialgewicht und damit die Materialkosten.'
            },
            'ABS': {
              price: 27,
              gramsPerMeter: 2.65,
              density: 1.10,
              densityHint: 'Richtwert: 2,65\u00A0g/m · 1,10\u00A0g/cm³ (ABS). Der Wert steuert Materialgewicht und damit die Materialkosten.'
            },
            'ABS_CF': {
              price: 58,
              gramsPerMeter: 2.60,
              density: 1.08,
              densityHint: 'Richtwert: 2,60\u00A0g/m · 1,08\u00A0g/cm³ (ABS-CF). Der Wert steuert Materialgewicht und damit die Materialkosten.'
            },
            'ASA': {
              price: 35,
              gramsPerMeter: 2.57,
              density: 1.07,
              densityHint: 'Richtwert: 2,57\u00A0g/m · 1,07\u00A0g/cm³ (ASA). Der Wert steuert Materialgewicht und damit die Materialkosten.'
            },
            'ASA_CF': {
              price: 60,
              gramsPerMeter: 2.70,
              density: 1.12,
              densityHint: 'Richtwert: 2,70\u00A0g/m · 1,12\u00A0g/cm³ (ASA-CF). Der Wert steuert Materialgewicht und damit die Materialkosten.'
            },
            'TPU': {
              price: 30,
              gramsPerMeter: 2.85,
              density: 1.19,
              densityHint: 'Richtwert: 2,85\u00A0g/m · 1,19\u00A0g/cm³ (TPU). Der Wert steuert Materialgewicht und damit die Materialkosten.'
            },
            'PA': {
              price: 45,
              gramsPerMeter: 2.74,
              density: 1.14,
              densityHint: 'Richtwert: 2,74\u00A0g/m · 1,14\u00A0g/cm³ (Nylon). Der Wert steuert Materialgewicht und damit die Materialkosten.'
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
          var NOZZLE_DEFAULT_DIAMETER = '0.4 mm';
          var NOZZLE_DEFAULT_TYPE = 'Standard';

          function setFieldErrorState(field, errorElement, message) {
            if (field) {
              if (message) {
                field.classList.add('is-invalid');
                field.setAttribute('aria-invalid', 'true');
              } else {
                field.classList.remove('is-invalid');
                field.removeAttribute('aria-invalid');
              }
            }
            if (errorElement) {
              if (message) {
                errorElement.textContent = message;
                errorElement.hidden = false;
                errorElement.setAttribute('aria-hidden', 'false');
              } else {
                errorElement.textContent = '';
                errorElement.hidden = true;
                errorElement.setAttribute('aria-hidden', 'true');
              }
            }
          }

          function selectHasOption(select, value) {
            if (!select || !value) {
              return false;
            }
            return Array.prototype.some.call(select.options || [], function (option) {
              return option.value === value;
            });
          }

          function setSelectValueIfExists(select, value) {
            if (!select || !value) {
              return false;
            }
            if (selectHasOption(select, value)) {
              select.value = value;
              return true;
            }
            return false;
          }

          function parseLegacyNozzleValue(value) {
            var text = value == null ? '' : value.toString().trim();
            if (!text) {
              return { diameter: '', type: '' };
            }
            var diameter = '';
            var diameterMatch = text.match(/(0(?:\.[2468])?|1\.0)\s*mm/i);
            if (diameterMatch && diameterMatch[1]) {
              var normalized = diameterMatch[1].replace(',', '.');
              diameter = normalized + ' mm';
            }
            var type = '';
            if (/gehärtet/i.test(text)) {
              type = 'gehärtet';
            } else if (/standard/i.test(text)) {
              type = 'Standard';
            }
            if (!type) {
              var lower = text.toLowerCase();
              if (lower === 'gehärtet') {
                type = 'gehärtet';
              } else if (lower === 'standard') {
                type = 'Standard';
              }
            }
            return { diameter: diameter, type: type };
          }

          function applyLegacyNozzleValue(value) {
            if (!nozzleDiameterSelect || !nozzleTypeSelect) {
              return;
            }
            var parsed = parseLegacyNozzleValue(value);
            if (!parsed) {
              return;
            }
            if (parsed.diameter) {
              setSelectValueIfExists(nozzleDiameterSelect, parsed.diameter);
            }
            if (parsed.type) {
              setSelectValueIfExists(nozzleTypeSelect, parsed.type);
            }
          }

          function ensureNozzleDefaults() {
            if (!nozzleDiameterSelect || !nozzleTypeSelect) {
              return;
            }
            var diameterCurrent = getInputRaw(nozzleDiameterSelect);
            var typeCurrent = getInputRaw(nozzleTypeSelect);
            var diameterApplied = false;
            var typeApplied = false;
            if (!diameterCurrent) {
              diameterApplied = setSelectValueIfExists(nozzleDiameterSelect, NOZZLE_DEFAULT_DIAMETER);
            }
            if (!typeCurrent) {
              typeApplied = setSelectValueIfExists(nozzleTypeSelect, NOZZLE_DEFAULT_TYPE);
            }
            if (diameterApplied) {
              schedulePersistenceForTarget(nozzleDiameterSelect, true);
            }
            if (typeApplied) {
              schedulePersistenceForTarget(nozzleTypeSelect, true);
            }
          }

          function getNozzleSelection() {
            var diameterRaw = getInputRaw(nozzleDiameterSelect);
            var typeRaw = getInputRaw(nozzleTypeSelect);
            var diameterValue = diameterRaw ? diameterRaw.replace(/\s+/g, ' ').trim() : '';
            var typeValue = typeRaw ? typeRaw.replace(/\s+/g, ' ').trim() : '';
            var shouldValidate = proModeEnabled || (diameterValue.length > 0 && typeValue.length > 0);
            var diameterMessage = shouldValidate && !diameterValue ? 'Bitte Düsendurchmesser wählen.' : '';
            var typeMessage = shouldValidate && !typeValue ? 'Bitte Düsen-Typ wählen.' : '';
            setFieldErrorState(nozzleDiameterSelect, nozzleDiameterError, diameterMessage);
            setFieldErrorState(nozzleTypeSelect, nozzleTypeError, typeMessage);
            return {
              diameter: diameterValue,
              type: typeValue,
              combined: diameterValue && typeValue ? diameterValue + ' (' + typeValue + ')' : ''
            };
          }

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
                row.setAttribute('aria-hidden', (!enabled).toString());
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

          function setProState(on, options) {
            var opts = options || {};
            var enabled = !!on;
            setProModeEnabled(enabled, { skipRecalc: true });
            if (proPane) {
              proPane.classList.toggle('is-active', enabled);
              proPane.setAttribute('aria-hidden', (!enabled).toString());
            }
            if (!opts.skipRecalc) {
              recalculate();
            }
            if (proPersistence && proPersistence.isRemembering() && !opts.skipPersist) {
              proPersistence.saveImmediate();
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

          function padNumber(value) {
            var numValue = Number(value);
            if (!isFinite(numValue)) {
              numValue = 0;
            }
            var integer = Math.floor(Math.abs(numValue));
            return integer.toString().padStart(2, '0');
          }

          function formatNow() {
            var now = new Date();
            return now.getFullYear().toString() + padNumber(now.getMonth() + 1) + padNumber(now.getDate()) + '-' + padNumber(now.getHours()) + padNumber(now.getMinutes());
          }

          function formatHoursToTime(hours) {
            if (!isFinite(hours) || hours < 0) {
              return '';
            }
            var totalMinutes = Math.round(hours * 60);
            if (totalMinutes < 0) {
              totalMinutes = 0;
            }
            var hoursPart = Math.floor(totalMinutes / 60);
            var minutesPart = Math.abs(totalMinutes % 60);
            return padNumber(hoursPart) + ':' + padNumber(minutesPart);
          }

          function normalizeString(value) {
            if (value == null) {
              return '';
            }
            return value.toString().trim();
          }

          function buildPostalCity(postal, city) {
            var postalValue = normalizeString(postal);
            var cityValue = normalizeString(city);
            if (postalValue && cityValue) {
              return postalValue + ' ' + cityValue;
            }
            return postalValue || cityValue;
          }

          function splitPostalCity(value) {
            var raw = normalizeString(value);
            if (!raw) {
              return { postal: '', city: '' };
            }
            var match = raw.match(/^([0-9]{4,6})\s*(.*)$/);
            if (match) {
              return {
                postal: normalizeString(match[1]),
                city: normalizeString(match[2])
              };
            }
            var parts = raw.split(/\s+/);
            if (parts.length > 1 && /^[0-9]+$/.test(parts[0])) {
              return {
                postal: normalizeString(parts.shift()),
                city: normalizeString(parts.join(' '))
              };
            }
            return { postal: '', city: raw };
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

          function setSectionVisibility(section, visible) {
            if (!section) {
              return;
            }
            var isVisible = !!visible;
            section.hidden = !isVisible;
            section.setAttribute('aria-hidden', (!isVisible).toString());
          }

          function setPrintButtonsDisabled(disabled) {
            var isDisabled = !!disabled;
            if (printOfferButton) {
              printOfferButton.disabled = isDisabled;
              if (isDisabled) {
                printOfferButton.setAttribute('aria-disabled', 'true');
              } else {
                printOfferButton.removeAttribute('aria-disabled');
              }
            }
            if (printInvoiceButton) {
              printInvoiceButton.disabled = isDisabled;
              if (isDisabled) {
                printInvoiceButton.setAttribute('aria-disabled', 'true');
              } else {
                printInvoiceButton.removeAttribute('aria-disabled');
              }
            }
          }

          function setDiscountValidity(isValid) {
            if (!discountPercentInput) {
              return;
            }
            var valid = !!isValid;
            if (valid) {
              discountPercentInput.classList.remove('is-invalid');
              discountPercentInput.removeAttribute('aria-invalid');
              if (discountErrorOutput) {
                discountErrorOutput.hidden = true;
                discountErrorOutput.setAttribute('aria-hidden', 'true');
                discountErrorOutput.textContent = '';
              }
              setPrintButtonsDisabled(false);
            } else {
              discountPercentInput.classList.add('is-invalid');
              discountPercentInput.setAttribute('aria-invalid', 'true');
              if (discountErrorOutput) {
                discountErrorOutput.hidden = false;
                discountErrorOutput.setAttribute('aria-hidden', 'false');
                discountErrorOutput.textContent = 'Rabatt darf nicht 100\u00A0% oder mehr betragen.';
              }
              setPrintButtonsDisabled(true);
            }
          }

          function isDiscountInvalid() {
            if (!discountPercentInput) {
              return false;
            }
            if (!proModeEnabled) {
              return false;
            }
            var raw = getInputRaw(discountPercentInput);
            if (!raw) {
              return false;
            }
            var parsed = num(raw);
            if (!Number.isFinite(parsed)) {
              return false;
            }
            return parsed >= 100;
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

          function buildDocumentTitleForMode(mode, state) {
            if (!mode || !state) {
              return null;
            }
            var labelMap = {
              offer: 'Angebot',
              invoice: 'Rechnung'
            };
            var label = labelMap[mode];
            if (!label) {
              return null;
            }
            var partSegment = normalizeFileNamePart(state.partName);
            var offerMeta = state.offer && state.offer.meta ? state.offer.meta : {};
            var invoiceMeta = state.offer && state.offer.invoice ? state.offer.invoice : {};
            var rawNumber = mode === 'invoice' ? invoiceMeta.number : offerMeta.number;
            var numberSegment = rawNumber ? normalizeFileNamePart(rawNumber) : '';
            var baseDate = parseDateValue(mode === 'invoice' ? invoiceMeta.date : offerMeta.date) || new Date();
            var dateSegment = formatDateForFile(baseDate);
            var segments = ['Warenschmiede', label];
            if (numberSegment) {
              segments.push(numberSegment);
            }
            if (partSegment && partSegment !== 'unbenannt') {
              segments.push(partSegment);
            }
            segments.push(dateSegment);
            return segments.join('_');
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
              materialDensityHint.textContent = defaults.densityHint || 'Richtwert nach Bedarf anpassen. Er beeinflusst Materialgewicht und -kosten.';
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

          function handleCalcInputEvent(event) {
            if (suppressCalcEvent) {
              return;
            }
            triggerRecalc();
            schedulePersistenceForTarget(event ? event.target : null, false);
          }

          function handleCalcChangeEvent(event) {
            if (suppressCalcEvent) {
              return;
            }
            triggerRecalc({ immediate: true });
            schedulePersistenceForTarget(event ? event.target : null, true);
          }

          function wireInputs() {
            var fields = $$('[data-calc],[data-calc-pro],[data-offer-field]');
            fields.forEach(function (el) {
              el.addEventListener('input', handleCalcInputEvent);
              el.addEventListener('change', handleCalcChangeEvent);
            });
          }

          function updatePrintTitleForMode(mode) {
            if (!printTitleElement) {
              return;
            }
            var titleMap = {
              offer: 'Angebot',
              invoice: 'Rechnung'
            };
            var title = titleMap[mode] || 'Angebot';
            if (printTitleElement.textContent !== title) {
              printTitleElement.textContent = title;
            }
          }

          function updatePrintFooterForMode(mode) {
            if (!printFooterBrandElement) {
              return;
            }
            var baseText = defaultPrintFooterText || 'Dieses Dokument wurde automatisch mit dem Warenschmiede-Kostenrechner erstellt. Transparente Preise – Made in Germany.';
            var textMap = {
              offer: baseText,
              invoice: baseText,
              internal: baseText,
              default: baseText
            };
            var nextText = textMap.hasOwnProperty(mode) ? textMap[mode] : textMap.default;
            if (printFooterBrandElement.textContent !== nextText) {
              printFooterBrandElement.textContent = nextText;
            }
          }

          function setDocumentPrintMode(mode) {
            if (document.documentElement) {
              if (mode) {
                document.documentElement.setAttribute('data-print-mode', mode);
              } else {
                document.documentElement.removeAttribute('data-print-mode');
              }
            }
          }

          function setBodyPrintMode(mode) {
            if (bodyElement) {
              if (mode) {
                bodyElement.setAttribute('print-mode', mode);
              } else {
                bodyElement.removeAttribute('print-mode');
              }
            }
            setDocumentPrintMode(mode);
            updatePrintTitleForMode(mode);
            updatePrintFooterForMode(mode);
          }

          function setBodyPaidState(paid) {
            var paidValue = paid ? 'true' : 'false';
            if (bodyElement) {
              bodyElement.dataset.paid = paidValue;
            }
            if (document.documentElement) {
              if (paid) {
                document.documentElement.setAttribute('data-paid', 'true');
              } else {
                document.documentElement.removeAttribute('data-paid');
              }
            }
          }

          function setPrintAttribute(mode) {
            if (!rootElement) return;
            if (mode) {
              rootElement.setAttribute('data-print', mode);
            } else {
              rootElement.removeAttribute('data-print');
            }
            if (mode) {
              setBodyPrintMode('internal');
              setBodyPaidState(false);
            } else {
              setBodyPrintMode(null);
              setBodyPaidState(false);
            }
          }

          function clearInvoiceError() {
            if (!invoiceErrorOutput) {
              return;
            }
            invoiceErrorOutput.textContent = '';
            invoiceErrorOutput.hidden = true;
            invoiceErrorOutput.setAttribute('aria-hidden', 'true');
          }

          function showInvoiceError(message) {
            if (!invoiceErrorOutput) {
              return;
            }
            invoiceErrorOutput.textContent = message;
            invoiceErrorOutput.hidden = false;
            invoiceErrorOutput.setAttribute('aria-hidden', 'false');
          }

          function ensureInvoiceNumber() {
            if (!invoiceNumberInput) {
              return '';
            }
            var current = invoiceNumberInput.value != null ? invoiceNumberInput.value.toString().trim() : '';
            if (current) {
              return current;
            }
            var now = new Date();
            var year = now.getFullYear();
            var counterKey = 'ws.invoiceCounter.' + year;
            var storedCounterRaw = getStorageItem(counterKey);
            var counter = parseInt(storedCounterRaw, 10);
            if (!isFinite(counter) || counter < 0) {
              counter = 0;
            }
            counter += 1;
            setStorageItem(counterKey, counter.toString());
            var invoiceNumber = 'RE-' + year + '-' + String(counter).padStart(3, '0');
            invoiceNumberInput.value = invoiceNumber;
            schedulePersistenceForTarget(invoiceNumberInput, true);
            setStorageItem('ws.invoice.lastNumber', invoiceNumber);
            return invoiceNumber;
          }

          function ensureInvoiceDates() {
            var todayValue = formatDateForInputValue(new Date());
            if (invoiceDateInput) {
              var currentDate = invoiceDateInput.value != null ? invoiceDateInput.value.toString().trim() : '';
              if (!currentDate) {
                invoiceDateInput.value = todayValue;
                schedulePersistenceForTarget(invoiceDateInput, true);
              }
            }
            if (serviceDateInput) {
              var currentService = serviceDateInput.value != null ? serviceDateInput.value.toString().trim() : '';
              if (!currentService) {
                var source = invoiceDateInput && invoiceDateInput.value ? invoiceDateInput.value : todayValue;
                serviceDateInput.value = source;
                schedulePersistenceForTarget(serviceDateInput, true);
              }
            }
          }

          function syncPaidControls() {
            if (!paidDateInput) {
              return;
            }
            if (markInvoicePaidCheckbox && markInvoicePaidCheckbox.checked) {
              paidDateInput.disabled = false;
              if (!paidDateInput.value) {
                paidDateInput.value = formatDateForInputValue(new Date());
              }
            } else {
              paidDateInput.disabled = true;
            }
          }

          function ensureInvoicePrintable() {
            clearInvoiceError();
            var requiredBankFields = [
              { key: 'vendorIban', label: 'IBAN' },
              { key: 'vendorBic', label: 'BIC' },
              { key: 'vendorBankName', label: 'Bankname' }
            ];
            var missingBankFields = requiredBankFields.filter(function (entry) {
              return !getOfferValue(entry.key);
            });
            if (missingBankFields.length > 0) {
              var missingLabels = missingBankFields.map(function (entry) {
                return entry.label;
              });
              var missingText = missingLabels[0];
              if (missingLabels.length === 2) {
                missingText = missingLabels[0] + ' und ' + missingLabels[1];
              } else if (missingLabels.length > 2) {
                missingText = missingLabels.slice(0, -1).join(', ') + ' und ' + missingLabels[missingLabels.length - 1];
              }
              showInvoiceError('Bitte ' + missingText + ' hinterlegen (Anbieter → Bankdaten).');
              var firstMissing = missingBankFields[0];
              if (firstMissing && offerFieldMap[firstMissing.key] && typeof offerFieldMap[firstMissing.key].focus === 'function') {
                offerFieldMap[firstMissing.key].focus();
              }
              return false;
            }
            ensureInvoiceNumber();
            ensureInvoiceDates();
            syncPaidControls();
            var isPaid = markInvoicePaidCheckbox ? !!markInvoicePaidCheckbox.checked : false;
            if (isPaid && paidDateInput && !paidDateInput.value) {
              paidDateInput.value = formatDateForInputValue(new Date());
            }
            return true;
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

          function applyPrintTightClass(root) {
            if (!root) {
              return false;
            }
            var inputsPage = root.querySelector('.calc-print__page[data-page="inputs"]');
            if (!inputsPage) {
              return false;
            }
            inputsPage.classList.remove('print-tight');
            var clientHeight = inputsPage.clientHeight;
            if (!clientHeight) {
              return false;
            }
            var overflow = Math.ceil(inputsPage.scrollHeight) - Math.ceil(clientHeight) > 1;
            if (overflow) {
              inputsPage.classList.add('print-tight');
              overflow = Math.ceil(inputsPage.scrollHeight) - Math.ceil(inputsPage.clientHeight) > 1;
            }
            return inputsPage.classList.contains('print-tight');
          }

          function updatePrintTightClassForSummary() {
            var summary = document.getElementById('printSummary');
            if (!summary) {
              return false;
            }
            var previous = {
              display: summary.style.display,
              position: summary.style.position,
              visibility: summary.style.visibility,
              pointerEvents: summary.style.pointerEvents,
              left: summary.style.left,
              top: summary.style.top,
              width: summary.style.width,
              maxWidth: summary.style.maxWidth
            };
            summary.style.display = 'block';
            summary.style.position = 'fixed';
            summary.style.visibility = 'hidden';
            summary.style.pointerEvents = 'none';
            summary.style.left = '-9999px';
            summary.style.top = '0';
            summary.style.width = PRINT_PAGE_WIDTH_MM + 'mm';
            summary.style.maxWidth = 'none';
            try {
              return applyPrintTightClass(summary);
            } finally {
              summary.style.display = previous.display || '';
              summary.style.position = previous.position || '';
              summary.style.visibility = previous.visibility || '';
              summary.style.pointerEvents = previous.pointerEvents || '';
              summary.style.left = previous.left || '';
              summary.style.top = previous.top || '';
              summary.style.width = previous.width || '';
              summary.style.maxWidth = previous.maxWidth || '';
            }
          }

          function clearPrintTightClass() {
            var summary = document.getElementById('printSummary');
            if (!summary) {
              return;
            }
            var inputsPage = summary.querySelector('.calc-print__page[data-page="inputs"]');
            if (inputsPage) {
              inputsPage.classList.remove('print-tight');
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
              var chartHintClone = stage.querySelector('.calc-print__chart-hint');
              if (chartHintClone && chartHintClone.parentNode) {
                chartHintClone.parentNode.removeChild(chartHintClone);
              }
              var inputsSectionClone = stage.querySelector('#printInputsSection');
              if (inputsSectionClone && inputsSectionClone.parentNode) {
                inputsSectionClone.parentNode.removeChild(inputsSectionClone);
              }
            } else {
              applyPrintTightClass(stage);
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
              }
              cleanupStage(stage);
              return canvases;
            }).catch(function (error) {
              if (footer) {
                footer.classList.remove('ws-print-footer--manual');
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
              if (mode === 'full') {
                updatePrintTightClassForSummary();
              } else {
                clearPrintTightClass();
              }
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
            if (resolvedMode === 'full') {
              updatePrintTightClassForSummary();
            } else {
              clearPrintTightClass();
            }
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
            schedulePersistenceForTarget(timeInput, true);
          }

          function getOfferValue(key) {
            var field = offerFieldMap[key];
            if (!field) {
              return '';
            }
            var raw = field.value;
            return raw == null ? '' : raw.toString().trim();
          }

          function setOfferFieldValue(key, value) {
            var field = offerFieldMap[key];
            if (!field) {
              return;
            }
            var normalized = value == null ? '' : value;
            field.value = normalized;
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
              schedulePersistenceForTarget(field, true);
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
                schedulePersistenceForTarget(offerDateField, true);
              }
            }
            var validUntilField = offerFieldMap.offerValidUntil;
            if (validUntilField) {
              var validCurrent = validUntilField.value != null ? validUntilField.value.toString().trim() : '';
              if (!validCurrent) {
                var validDate = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
                validUntilField.value = formatDateForInputValue(validDate);
                schedulePersistenceForTarget(validUntilField, true);
              }
            }
            var deliveryField = offerFieldMap.offerDeliveryTime;
            if (deliveryField) {
              var deliveryCurrent = deliveryField.value != null ? deliveryField.value.toString().trim() : '';
              if (!deliveryCurrent) {
                deliveryField.value = '7–10 Tage ab Auftragsklarheit';
                schedulePersistenceForTarget(deliveryField, true);
              }
            }
            var paymentField = offerFieldMap.offerPaymentTerms;
            if (paymentField) {
              var paymentCurrent = paymentField.value != null ? paymentField.value.toString().trim() : '';
              if (!paymentCurrent) {
                paymentField.value = 'Vorkasse / 14 Tage netto';
                schedulePersistenceForTarget(paymentField, true);
              }
            }
            var invoiceDateField = offerFieldMap.invoiceDate;
            if (invoiceDateField) {
              var invoiceCurrent = invoiceDateField.value != null ? invoiceDateField.value.toString().trim() : '';
              if (!invoiceCurrent) {
                invoiceDateField.value = formatDateForInputValue(today);
                schedulePersistenceForTarget(invoiceDateField, true);
              }
            }
            var serviceDateField = offerFieldMap.serviceDate;
            if (serviceDateField) {
              var serviceCurrent = serviceDateField.value != null ? serviceDateField.value.toString().trim() : '';
              if (!serviceCurrent) {
                serviceDateField.value = formatDateForInputValue(today);
                schedulePersistenceForTarget(serviceDateField, true);
              }
            }
            suggestOfferNumber();
          }

          function applyStoredBankData() {
            var bankMappings = [
              { key: 'vendorIban', storage: 'ws.company.iban' },
              { key: 'vendorBic', storage: 'ws.company.bic' },
              { key: 'vendorBankName', storage: 'ws.company.bankname' }
            ];
            bankMappings.forEach(function (entry) {
              var field = offerFieldMap[entry.key];
              if (!field) {
                return;
              }
              var current = field.value != null ? field.value.toString().trim() : '';
              if (current) {
                return;
              }
              var stored = getStorageItem(entry.storage);
              if (stored && stored.toString().trim()) {
                field.value = stored;
                validateOfferField(field);
              }
            });
          }

          function handleNoteInput(input, storageKey) {
            if (!input) {
              return;
            }
            var stored = getStorageItem(storageKey);
            if (typeof stored === 'string') {
              input.value = stored;
            }
            var updateNote = function () {
              var raw = input.value != null ? input.value.toString() : '';
              var trimmed = raw.trim();
              if (trimmed) {
                setStorageItem(storageKey, raw);
              } else {
                removeStorageItem(storageKey);
              }
              triggerRecalc({ immediate: true });
            };
            input.addEventListener('input', updateNote);
            input.addEventListener('change', updateNote);
          }

          function initializeDocumentNotes() {
            handleNoteInput(offerNoteInput, 'ws.notes.offer');
            handleNoteInput(invoiceNoteInput, 'ws.notes.invoice');
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
              vatId: fields.vendorVatId || '',
              iban: fields.vendorIban || '',
              bic: fields.vendorBic || '',
              bankName: fields.vendorBankName || ''
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
            var invoice = {
              number: fields.invoiceNumber || '',
              date: fields.invoiceDate || '',
              serviceDate: fields.serviceDate || ''
            };
            var hasVendor = hasNonEmptyValue([
              vendor.name,
              vendor.contact,
              vendor.street,
              vendor.postalCode,
              vendor.city,
              vendor.email,
              vendor.phone,
              vendor.vatId,
              vendor.iban,
              vendor.bic,
              vendor.bankName
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
              invoice: invoice,
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

          function getFieldKey(field) {
            if (!field) {
              return null;
            }
            var explicit = field.getAttribute ? field.getAttribute('data-storage-key') : null;
            if (explicit) {
              return explicit;
            }
            if (field.name) {
              return field.name;
            }
            if (field.id) {
              return field.id;
            }
            return null;
          }

          function collectInputValues(fields) {
            var values = {};
            if (!fields || !fields.length) {
              return values;
            }
            fields.forEach(function (field) {
              var key = getFieldKey(field);
              if (!key) {
                return;
              }
              var type = (field.type || '').toLowerCase();
              if (type === 'checkbox') {
                values[key] = !!field.checked;
              } else if (type === 'radio') {
                if (field.checked) {
                  values[key] = field.value;
                }
              } else if (field.tagName === 'SELECT' && field.multiple) {
                var selected = Array.prototype.slice.call(field.options).filter(function (option) {
                  return option.selected;
                }).map(function (option) {
                  return option.value;
                });
                values[key] = selected;
              } else {
                values[key] = field.value != null ? field.value.toString() : '';
              }
            });
            return values;
          }

          function applyInputValues(fields, values) {
            if (!fields || !fields.length || !values) {
              return;
            }
            fields.forEach(function (field) {
              var key = getFieldKey(field);
              if (!key || !(key in values)) {
                return;
              }
              var stored = values[key];
              var type = (field.type || '').toLowerCase();
              if (type === 'checkbox') {
                field.checked = !!stored;
              } else if (type === 'radio') {
                if (stored == null) {
                  return;
                }
                field.checked = stored === field.value;
              } else if (field.tagName === 'SELECT' && field.multiple && Array.isArray(stored)) {
                Array.prototype.slice.call(field.options).forEach(function (option) {
                  option.selected = stored.indexOf(option.value) !== -1;
                });
              } else {
                field.value = stored == null ? '' : stored;
              }
            });
          }

          function downloadJson(data, fileName) {
            try {
              var serialized = JSON.stringify(data, null, 2);
              var blob = new Blob([serialized], { type: 'application/json' });
              downloadBlob(blob, fileName);
              return true;
            } catch (error) {
              console.error('JSON-Download fehlgeschlagen', error);
              return false;
            }
          }

          function pushAutosave(snapshot) {
            if (!snapshot || typeof snapshot !== 'object') {
              return;
            }
            try {
              if (!window.localStorage) {
                return;
              }
            } catch (storageCheckError) {
              return;
            }
            try {
              var serialized = JSON.stringify(snapshot);
              var entry = JSON.parse(serialized);
              var existingRaw = window.localStorage.getItem(AUTOSAVE_STORAGE_KEY);
              var entries = [];
              if (existingRaw) {
                try {
                  var parsed = JSON.parse(existingRaw);
                  if (Array.isArray(parsed)) {
                    entries = parsed;
                  }
                } catch (parseError) {
                  entries = [];
                }
              }
              entries.unshift(entry);
              if (entries.length > 5) {
                entries = entries.slice(0, 5);
              }
              window.localStorage.setItem(AUTOSAVE_STORAGE_KEY, JSON.stringify(entries));
            } catch (error) {
              // ignore autosave errors silently
            }
          }

          function migrateIfNeeded(snapshot) {
            if (!snapshot || typeof snapshot !== 'object') {
              return null;
            }
            return snapshot;
          }

          function collectState() {
            var computed = recalculate();
            var state = computed || lastValidState || null;
            var timestamp = new Date();
            var locale = (window.navigator && window.navigator.language) ? window.navigator.language : 'de-DE';
            var partNameRaw = getInputRaw(partNameInput);
            var partNameTrimmed = partNameRaw ? partNameRaw.trim() : '';
            var vendorPostal = getOfferValue('vendorPostalCode');
            var vendorCity = getOfferValue('vendorCity');
            var customerPostal = getOfferValue('customerPostalCode');
            var customerCity = getOfferValue('customerCity');
            var timeValue = timeInput && timeInput.value ? timeInput.value : '';
            var hoursValue = state ? state.hours : parseHours(timeValue || '0:00');
            var weightRaw = getInputRaw(weightInput);
            var lengthRaw = getInputRaw(lengthInput);
            var weightValue = state ? state.weight : (weightRaw ? num(weightRaw) : 0);
            if (!isFinite(weightValue)) {
              weightValue = 0;
            }
            var lengthValue = state ? state.length : (lengthRaw ? num(lengthRaw) : 0);
            if (!isFinite(lengthValue)) {
              lengthValue = 0;
            }
            var materialDensityValue = readNumber(materialDensityInput);
            var powerValue = readNumber(powerInput);
            var energyPriceValue = readNumber(energyPriceInput);
            var loadFactorValue = readNumber(loadFactorInput);
            var loadFactorNormalized = Math.min(Math.max(loadFactorValue, 0), 100);
            var energyKwh = (powerValue / 1000) * hoursValue * (loadFactorNormalized / 100);
            if (!isFinite(energyKwh)) {
              energyKwh = 0;
            }
            var wastePercentValue = wastePercentInput ? readNumber(wastePercentInput) : 0;
            var profitMarginValue = readNumber(profitMarginInput);
            var discountPercentValue = readNumber(discountPercentInput);
            var fixedCostValue = readNumber(fixedCostInput);
            var packagingValue = readNumber(packagingCostInput);
            var shippingValue = readNumber(shippingCostInput);
            var errorRateValue = readNumber(errorRateInput);
            var hourlyRateValue = readNumber(hourlyRateInput);
            var setupMinutesValue = readNumber(setupMinutesInput);
            var finishingMinutesValue = readNumber(finishingMinutesInput);
            var proPrintMinutesValue = readNumber(proPrintMinutesInput);
            var machineHourlyValue = readNumber(machineHourlyInput);
            var machinePurchaseValue = readNumber(machinePurchaseInput);
            var machineLifetimeValue = readNumber(machineLifetimeInput);
            var nozzleSelection = getNozzleSelection();
            var proNoteValue = proNoteInput ? normalizeString(proNoteInput.value) : '';
            var offerNoteValue = offerNoteInput ? normalizeString(offerNoteInput.value) : '';
            var invoiceNoteValue = invoiceNoteInput ? normalizeString(invoiceNoteInput.value) : '';
            var materialLabel = '';
            if (materialSelect && materialSelect.options && materialSelect.selectedIndex >= 0) {
              materialLabel = materialSelect.options[materialSelect.selectedIndex].textContent || '';
            }
            var provider = {
              firma: getOfferValue('vendorName'),
              ansprechpartner: getOfferValue('vendorContact'),
              strasse: getOfferValue('vendorStreet'),
              plz: vendorPostal,
              ort: vendorCity,
              plzOrt: buildPostalCity(vendorPostal, vendorCity),
              email: getOfferValue('vendorEmail'),
              telefon: getOfferValue('vendorPhone'),
              ustId: getOfferValue('vendorVatId'),
              iban: getOfferValue('vendorIban'),
              bic: getOfferValue('vendorBic'),
              bank: getOfferValue('vendorBankName')
            };
            var customerNameValue = getOfferValue('customerName');
            var customerContactValue = getOfferValue('customerContact');
            var customer = {
              firma: customerNameValue,
              name: customerContactValue || customerNameValue,
              ansprechpartner: customerContactValue,
              strasse: getOfferValue('customerStreet'),
              plz: customerPostal,
              ort: customerCity,
              plzOrt: buildPostalCity(customerPostal, customerCity),
              email: getOfferValue('customerEmail'),
              telefon: getOfferValue('customerPhone')
            };
            var docs = {
              angebotsNr: getOfferValue('offerNumber'),
              angebotsdatum: getOfferValue('offerDate'),
              gueltigBis: getOfferValue('offerValidUntil'),
              lieferzeit: getOfferValue('offerDeliveryTime'),
              zahlungsbedingungen: getOfferValue('offerPaymentTerms'),
              rechnungsNr: getOfferValue('invoiceNumber'),
              rechnungsdatum: getOfferValue('invoiceDate'),
              leistungsdatum: getOfferValue('serviceDate'),
              bereitsBezahlt: markInvoicePaidCheckbox ? !!markInvoicePaidCheckbox.checked : false,
              bezahltAm: paidDateInput && paidDateInput.value ? paidDateInput.value : null,
              notizAngebot: offerNoteValue,
              notizRechnung: invoiceNoteValue
            };
            var calc = {
              teilname: partNameTrimmed,
              mode: weightMode && weightMode.checked ? 'weight' : 'length',
              material: {
                typ: materialSelect ? materialSelect.value : '',
                label: materialLabel,
                preisProKg: readNumber(pricePerKgInput),
                verbrauchGramm: weightValue,
                mengeInput: {
                  gewicht: weightRaw,
                  laenge: lengthRaw
                },
                dichte: materialDensityValue,
                wastePercent: wastePercentValue
              },
              energie: {
                preisProKwh: energyPriceValue,
                kwh: energyKwh,
                leistungWatt: powerValue,
                lastfaktor: loadFactorNormalized
              },
              maschine: {
                stundensatz: machineHourlyValue,
                stunden: isFinite(hoursValue) ? hoursValue : 0,
                anschaffung: machinePurchaseValue,
                lebensdauer: machineLifetimeValue
              },
              marge: profitMarginValue,
              rabattProzent: discountPercentValue,
              rabattAbsolut: state && state.pro ? state.pro.discountValue : 0,
              fixkosten: fixedCostValue,
              verpackung: packagingValue,
              versand: shippingValue,
              fehlerrate: errorRateValue,
              druckParameter: {
                nozzle: nozzleSelection ? nozzleSelection.diameter : '',
                nozzleTyp: nozzleSelection ? nozzleSelection.type : '',
                materialdichte: materialDensityValue,
                layer: null,
                infill: null
              },
              zeit: {
                laufzeit: timeValue,
                setup: setupMinutesValue,
                print: proPrintMinutesValue,
                finishing: finishingMinutesValue,
                stundenlohn: hourlyRateValue
              },
              note: proNoteValue,
              proAktiv: proToggle ? !!proToggle.checked : false,
              chartAktiv: resultChartToggle ? !!resultChartToggle.checked : true,
              inputs: {
                pricePerKg: getInputRaw(pricePerKgInput),
                materialDensity: getInputRaw(materialDensityInput),
                wastePercent: getInputRaw(wastePercentInput),
                power: getInputRaw(powerInput),
                energyPrice: getInputRaw(energyPriceInput),
                loadFactor: getInputRaw(loadFactorInput),
                machineHourlyRate: getInputRaw(machineHourlyInput),
                machinePurchase: getInputRaw(machinePurchaseInput),
                machineLifetime: getInputRaw(machineLifetimeInput),
                packagingCost: getInputRaw(packagingCostInput),
                shippingCost: getInputRaw(shippingCostInput),
                profitMargin: getInputRaw(profitMarginInput),
                discountPercent: getInputRaw(discountPercentInput),
                errorRate: getInputRaw(errorRateInput),
                hourlyRate: getInputRaw(hourlyRateInput),
                setupMinutes: getInputRaw(setupMinutesInput),
                finishingMinutes: getInputRaw(finishingMinutesInput),
                proPrintMinutes: getInputRaw(proPrintMinutesInput)
              }
            };

            return {
              version: calcAppVersion,
              savedAt: timestamp.toISOString(),
              locale: locale,
              settings: {
                preiseInklMwst: vatCheckbox ? !!vatCheckbox.checked : false,
                mwstSatz: 0.19,
                proAktiv: calc.proAktiv,
                chartAktiv: calc.chartAktiv
              },
              provider: provider,
              customer: customer,
              docs: docs,
              calc: calc
            };
          }

          function serializeCurrentState() {
            var snapshot = collectState();
            var state = lastValidState;
            if (!snapshot || !state) {
              throw new Error('Aktuelle Kalkulation konnte nicht ermittelt werden.');
            }
            var docs = snapshot.docs || {};
            var offerState = state.offer || {};
            var offerMeta = offerState.meta || {};
            var invoiceMeta = offerState.invoice || {};
            var chartData = getCostChartData(state);
            var payload = {
              version: typeof calcAppVersion === 'string' ? calcAppVersion : 'v1',
              generatedAt: new Date().toISOString(),
              state: state,
              snapshot: snapshot,
              computed: {
                vatAmount: state.vatIncluded ? Math.max(state.gross - state.net, 0) : 0,
                dueDateText: resolveDueDateText(offerMeta.paymentTerms || '', invoiceMeta.date || '', offerMeta.date || ''),
                paid: docs.bereitsBezahlt === true,
                paidDate: docs.bezahltAm || '',
                chart: chartData,
                chartEnabled: state.chartEnabled && chartData && chartData.hasData,
                noteOffer: state.notes && state.notes.offer ? state.notes.offer : '',
                noteInvoice: state.notes && state.notes.invoice ? state.notes.invoice : ''
              }
            };
            return JSON.stringify(payload);
          }

          function applyState(snapshot) {
            if (!snapshot || typeof snapshot !== 'object') {
              return;
            }
            var settings = snapshot.settings || {};
            var calcData = snapshot.calc || {};
            var providerData = snapshot.provider || {};
            var customerData = snapshot.customer || {};
            var docsData = snapshot.docs || {};
            var materialDataSaved = calcData.material || {};
            var energyData = calcData.energie || {};
            var machineData = calcData.maschine || {};
            var timeData = calcData.zeit || {};
            var inputsData = calcData.inputs || {};
            var druckParameter = calcData.druckParameter || {};
            var noteValue = typeof calcData.note === 'string' ? calcData.note : '';
            var proActiveSetting = typeof settings.proAktiv === 'boolean' ? settings.proAktiv : (typeof calcData.proAktiv === 'boolean' ? calcData.proAktiv : (proToggle ? !!proToggle.checked : false));
            var chartActiveSetting = typeof settings.chartAktiv === 'boolean' ? settings.chartAktiv : (typeof calcData.chartAktiv === 'boolean' ? calcData.chartAktiv : true);
            var modeValue = typeof calcData.mode === 'string' ? calcData.mode.toLowerCase() : '';
            suppressCalcEvent = true;
            try {
              if (vatCheckbox) {
                vatCheckbox.checked = settings.preiseInklMwst === true;
              }
              if (resultChartToggle) {
                resultChartToggle.checked = !!chartActiveSetting;
                setChartVisibility(!!chartActiveSetting);
              }
              if (proToggle) {
                proToggle.checked = !!proActiveSetting;
                setProState(!!proActiveSetting, { skipRecalc: true, skipPersist: true });
              }
              if (partNameInput) {
                var partNameValue = calcData.teilname != null ? calcData.teilname : (calcData.partName != null ? calcData.partName : '');
                partNameInput.value = partNameValue;
              }
              if (weightMode && lengthMode) {
                if (modeValue === 'length') {
                  lengthMode.checked = true;
                  weightMode.checked = false;
                } else {
                  weightMode.checked = true;
                  lengthMode.checked = false;
                }
              }
              if (materialSelect && materialDataSaved.typ) {
                if (!setSelectValueIfExists(materialSelect, materialDataSaved.typ) && !materialSelect.value && materialSelect.options && materialSelect.options.length) {
                  materialSelect.selectedIndex = 0;
                }
              }
              setMaterialDefaults();
              var materialInputs = materialDataSaved.mengeInput || {};
              if (weightInput) {
                var weightFieldValue = materialInputs.gewicht != null ? materialInputs.gewicht : '';
                weightInput.value = weightFieldValue;
              }
              if (lengthInput) {
                var lengthFieldValue = materialInputs.laenge != null ? materialInputs.laenge : '';
                lengthInput.value = lengthFieldValue;
              }
              if (pricePerKgInput) {
                var priceRaw = inputsData.pricePerKg != null ? inputsData.pricePerKg : (materialDataSaved.preisProKg != null ? String(materialDataSaved.preisProKg) : '');
                pricePerKgProgrammatic = true;
                pricePerKgInput.value = priceRaw == null ? '' : priceRaw;
                pricePerKgProgrammatic = false;
                pricePerKgUserEdited = !!(priceRaw && priceRaw.toString().trim().length > 0);
              }
              if (materialDensityInput) {
                var densityRaw = inputsData.materialDensity != null ? inputsData.materialDensity : (materialDataSaved.dichte != null ? String(materialDataSaved.dichte) : '');
                materialDensityProgrammatic = true;
                materialDensityInput.value = densityRaw == null ? '' : densityRaw;
                materialDensityProgrammatic = false;
                materialDensityUserEdited = !!(densityRaw && densityRaw.toString().trim().length > 0);
                if (materialDensityUserEdited) {
                  materialDensityInput.setAttribute('data-user-set', '1');
                } else {
                  materialDensityInput.removeAttribute('data-user-set');
                }
              }
              if (wastePercentInput) {
                var wasteRaw = inputsData.wastePercent != null ? inputsData.wastePercent : (materialDataSaved.wastePercent != null ? String(materialDataSaved.wastePercent) : '');
                wastePercentInput.value = wasteRaw == null ? '' : wasteRaw;
              }
              if (powerInput) {
                var powerRaw = inputsData.power != null ? inputsData.power : (energyData.leistungWatt != null ? String(energyData.leistungWatt) : '');
                powerInput.value = powerRaw == null ? '' : powerRaw;
              }
              if (energyPriceInput) {
                var energyPriceRaw = inputsData.energyPrice != null ? inputsData.energyPrice : (energyData.preisProKwh != null ? String(energyData.preisProKwh) : '');
                energyPriceInput.value = energyPriceRaw == null ? '' : energyPriceRaw;
              }
              if (loadFactorInput) {
                var loadFactorRaw = inputsData.loadFactor != null ? inputsData.loadFactor : (energyData.lastfaktor != null ? String(energyData.lastfaktor) : '');
                loadFactorInput.value = loadFactorRaw == null ? '' : loadFactorRaw;
              }
              var timeResolved = '';
              if (typeof timeData.laufzeit === 'string' && timeData.laufzeit) {
                timeResolved = timeData.laufzeit;
              } else if (typeof machineData.stunden === 'number' && isFinite(machineData.stunden)) {
                timeResolved = formatHoursToTime(machineData.stunden);
              }
              if (timeInput) {
                timeSyncInProgress = true;
                try {
                  timeInput.value = timeResolved;
                } finally {
                  timeSyncInProgress = false;
                }
              }
              var proMinutesRaw = inputsData.proPrintMinutes != null ? inputsData.proPrintMinutes : (timeData.print != null ? String(timeData.print) : '');
              if (proPrintMinutesInput) {
                suppressProSync = true;
                try {
                  proPrintMinutesInput.value = proMinutesRaw == null ? '' : proMinutesRaw;
                } finally {
                  suppressProSync = false;
                }
              }
              if (hourlyRateInput) {
                var hourlyRaw = inputsData.hourlyRate != null ? inputsData.hourlyRate : (timeData.stundenlohn != null ? String(timeData.stundenlohn) : '');
                hourlyRateInput.value = hourlyRaw == null ? '' : hourlyRaw;
              }
              if (setupMinutesInput) {
                var setupRaw = inputsData.setupMinutes != null ? inputsData.setupMinutes : (timeData.setup != null ? String(timeData.setup) : '');
                setupMinutesInput.value = setupRaw == null ? '' : setupRaw;
              }
              if (finishingMinutesInput) {
                var finishingRaw = inputsData.finishingMinutes != null ? inputsData.finishingMinutes : (timeData.finishing != null ? String(timeData.finishing) : '');
                finishingMinutesInput.value = finishingRaw == null ? '' : finishingRaw;
              }
              if (profitMarginInput) {
                var marginRaw = inputsData.profitMargin != null ? inputsData.profitMargin : (calcData.marge != null ? String(calcData.marge) : '');
                profitMarginInput.value = marginRaw == null ? '' : marginRaw;
              }
              if (discountPercentInput) {
                var discountRaw = inputsData.discountPercent != null ? inputsData.discountPercent : (calcData.rabattProzent != null ? String(calcData.rabattProzent) : '');
                discountPercentInput.value = discountRaw == null ? '' : discountRaw;
              }
              if (fixedCostInput) {
                var fixedRaw = calcData.fixkosten != null ? String(calcData.fixkosten) : '';
                fixedCostInput.value = fixedRaw == null ? '' : fixedRaw;
              }
              if (packagingCostInput) {
                var packagingRaw = inputsData.packagingCost != null ? inputsData.packagingCost : (calcData.verpackung != null ? String(calcData.verpackung) : '');
                packagingCostInput.value = packagingRaw == null ? '' : packagingRaw;
              }
              if (shippingCostInput) {
                var shippingRaw = inputsData.shippingCost != null ? inputsData.shippingCost : (calcData.versand != null ? String(calcData.versand) : '');
                shippingCostInput.value = shippingRaw == null ? '' : shippingRaw;
              }
              if (errorRateInput) {
                var errorRaw = inputsData.errorRate != null ? inputsData.errorRate : (calcData.fehlerrate != null ? String(calcData.fehlerrate) : '');
                errorRateInput.value = errorRaw == null ? '' : errorRaw;
              }
              if (machineHourlyInput) {
                var machineHourlyRaw = inputsData.machineHourlyRate != null ? inputsData.machineHourlyRate : (machineData.stundensatz != null ? String(machineData.stundensatz) : '');
                machineHourlyProgrammatic = true;
                machineHourlyInput.value = machineHourlyRaw == null ? '' : machineHourlyRaw;
                machineHourlyProgrammatic = false;
                machineHourlyUserEdited = !!(machineHourlyRaw && machineHourlyRaw.toString().trim().length > 0);
              }
              if (machinePurchaseInput) {
                var machinePurchaseRaw = inputsData.machinePurchase != null ? inputsData.machinePurchase : (machineData.anschaffung != null ? String(machineData.anschaffung) : '');
                machinePurchaseInput.value = machinePurchaseRaw == null ? '' : machinePurchaseRaw;
              }
              if (machineLifetimeInput) {
                var machineLifetimeRaw = inputsData.machineLifetime != null ? inputsData.machineLifetime : (machineData.lebensdauer != null ? String(machineData.lebensdauer) : '');
                machineLifetimeInput.value = machineLifetimeRaw == null ? '' : machineLifetimeRaw;
              }
              if (nozzleDiameterSelect) {
                if (!setSelectValueIfExists(nozzleDiameterSelect, druckParameter.nozzle) && !druckParameter.nozzle) {
                  nozzleDiameterSelect.value = '';
                }
              }
              if (nozzleTypeSelect) {
                var nozzleTypeValue = druckParameter.nozzleTyp != null ? druckParameter.nozzleTyp : druckParameter.nozzleType;
                if (!setSelectValueIfExists(nozzleTypeSelect, nozzleTypeValue) && !nozzleTypeValue) {
                  nozzleTypeSelect.value = '';
                }
              }
              if (proNoteInput) {
                proNoteInput.value = noteValue;
              }
              if (offerNoteInput) {
                offerNoteInput.value = docsData.notizAngebot != null ? docsData.notizAngebot : '';
              }
              if (invoiceNoteInput) {
                invoiceNoteInput.value = docsData.notizRechnung != null ? docsData.notizRechnung : '';
              }
              var providerPostal = normalizeString(providerData.plz);
              var providerCity = normalizeString(providerData.ort);
              if (!providerPostal && !providerCity && providerData.plzOrt) {
                var providerSplit = splitPostalCity(providerData.plzOrt);
                providerPostal = providerSplit.postal;
                providerCity = providerSplit.city;
              }
              setOfferFieldValue('vendorName', providerData.firma != null ? providerData.firma : providerData.name);
              setOfferFieldValue('vendorContact', providerData.ansprechpartner);
              setOfferFieldValue('vendorStreet', providerData.strasse);
              setOfferFieldValue('vendorPostalCode', providerPostal);
              setOfferFieldValue('vendorCity', providerCity);
              setOfferFieldValue('vendorEmail', providerData.email);
              setOfferFieldValue('vendorPhone', providerData.telefon);
              setOfferFieldValue('vendorVatId', providerData.ustId);
              setOfferFieldValue('vendorIban', providerData.iban);
              setOfferFieldValue('vendorBic', providerData.bic);
              setOfferFieldValue('vendorBankName', providerData.bank);
              var customerPostalResolved = normalizeString(customerData.plz);
              var customerCityResolved = normalizeString(customerData.ort);
              if (!customerPostalResolved && !customerCityResolved && customerData.plzOrt) {
                var customerSplit = splitPostalCity(customerData.plzOrt);
                customerPostalResolved = customerSplit.postal;
                customerCityResolved = customerSplit.city;
              }
              setOfferFieldValue('customerName', customerData.firma != null ? customerData.firma : customerData.name);
              setOfferFieldValue('customerContact', customerData.ansprechpartner);
              setOfferFieldValue('customerStreet', customerData.strasse);
              setOfferFieldValue('customerPostalCode', customerPostalResolved);
              setOfferFieldValue('customerCity', customerCityResolved);
              setOfferFieldValue('customerEmail', customerData.email);
              setOfferFieldValue('customerPhone', customerData.telefon);
              setOfferFieldValue('offerNumber', docsData.angebotsNr);
              setOfferFieldValue('offerDate', docsData.angebotsdatum);
              setOfferFieldValue('offerValidUntil', docsData.gueltigBis);
              setOfferFieldValue('offerDeliveryTime', docsData.lieferzeit);
              setOfferFieldValue('offerPaymentTerms', docsData.zahlungsbedingungen);
              setOfferFieldValue('invoiceNumber', docsData.rechnungsNr);
              setOfferFieldValue('invoiceDate', docsData.rechnungsdatum);
              setOfferFieldValue('serviceDate', docsData.leistungsdatum);
              if (markInvoicePaidCheckbox) {
                markInvoicePaidCheckbox.checked = docsData.bereitsBezahlt === true;
              }
              if (paidDateInput) {
                paidDateInput.value = docsData.bezahltAm || '';
              }
            } finally {
              suppressCalcEvent = false;
            }
            updateMaterialSuggestionState(currentMaterialDefaults);
            ensureNozzleDefaults();
            getNozzleSelection();
            updateModeVisibility();
            syncPaidControls();
            clearInvoiceError();
            offerFields.forEach(function (field) {
              validateOfferField(field);
            });
            triggerRecalc({ immediate: true });
            if (standardPersistence && typeof standardPersistence.saveImmediate === 'function') {
              standardPersistence.saveImmediate({ skipTrack: true });
            }
            if (proPersistence && typeof proPersistence.saveImmediate === 'function') {
              proPersistence.saveImmediate({ skipTrack: true });
            }
            if (sellerPersistence && typeof sellerPersistence.saveImmediate === 'function') {
              sellerPersistence.saveImmediate({ skipTrack: true });
            }
            if (customerPersistence && typeof customerPersistence.saveImmediate === 'function') {
              customerPersistence.saveImmediate({ skipTrack: true });
            }
          }

          function sanitizeForFileName(value) {
            if (!value) {
              return '';
            }
            var text = value.toString().trim();
            if (!text) {
              return '';
            }
            var transliterated = text.replace(/[äÄöÖüÜß]/g, function (char) {
              switch (char) {
                case 'ä':
                  return 'ae';
                case 'Ä':
                  return 'Ae';
                case 'ö':
                  return 'oe';
                case 'Ö':
                  return 'Oe';
                case 'ü':
                  return 'ue';
                case 'Ü':
                  return 'Ue';
                case 'ß':
                  return 'ss';
                default:
                  return '';
              }
            });
            var asciiOnly = transliterated.replace(/[^0-9A-Za-z _-]/g, '');
            var withUnderscores = asciiOnly.replace(/\s+/g, '_');
            var collapsed = withUnderscores.replace(/_+/g, '_').replace(/^_+|_+$/g, '');
            if (collapsed.length > 40) {
              collapsed = collapsed.slice(0, 40);
            }
            return collapsed;
          }

          function buildSuggestedFileName(snapshot) {
            var fallback = 'warenschmiede-save-' + formatNow() + '.json';
            if (!snapshot || typeof snapshot !== 'object') {
              return fallback;
            }
            var customer = snapshot.customer || {};
            var docs = snapshot.docs || {};
            var nummerRaw = docs.rechnungsNr || docs.angebotsNr || '';
            var nummer = nummerRaw ? nummerRaw.toString().trim() : '';
            if (nummer) {
              nummer = nummer.replace(/[\/:*?"<>|]+/g, '_');
            }
            var kundeKurz = sanitizeForFileName(customer.firma || customer.name || '');
            if (kundeKurz && nummer) {
              return 'Kunde_' + kundeKurz + '__' + nummer + '.json';
            }
            if (nummer) {
              return nummer + '.json';
            }
            return fallback;
          }

          function serializeSnapshot(snapshot) {
            try {
              return JSON.stringify(snapshot, null, 2);
            } catch (error) {
              console.error('Snapshot konnte nicht serialisiert werden', error);
              return null;
            }
          }

          function saveCurrent() {
            var snapshot = collectState();
            if (!snapshot) {
              showToastMessage('Datei konnte nicht gespeichert werden.');
              return;
            }
            var fileName = buildSuggestedFileName(snapshot);
            var serialized = serializeSnapshot(snapshot);
            if (!serialized) {
              showToastMessage('Datei konnte nicht gespeichert werden.');
              return;
            }
            var hasFilePicker = typeof window !== 'undefined' && window && typeof window.showSaveFilePicker === 'function';
            if (hasFilePicker) {
              var pickerOptions = {
                suggestedName: fileName,
                types: [
                  {
                    description: 'Warenschmiede JSON',
                    accept: {
                      'application/json': ['.json']
                    }
                  }
                ]
              };
              Promise.resolve()
                .then(function () {
                  return window.showSaveFilePicker(pickerOptions);
                })
                .then(function (handle) {
                  if (!handle || typeof handle.createWritable !== 'function') {
                    throw new Error('Ungültiges FileSystemHandle');
                  }
                  return handle.createWritable().then(function (writable) {
                    return Promise.resolve()
                      .then(function () {
                        return writable.write(serialized);
                      })
                      .then(function () {
                        return writable.close();
                      })
                      .then(function () {
                        return handle;
                      });
                  });
                })
                .then(function (handle) {
                  pushAutosave(snapshot);
                  var resolvedName = handle && handle.name ? handle.name : fileName;
                  showToastMessage('Ergebnis gespeichert (' + resolvedName + ').');
                })
                .catch(function (error) {
                  var isAbort = error && (error.name === 'AbortError' || error.name === 'NotAllowedError');
                  if (!isAbort) {
                    console.error('Speichern über Datei-Dialog fehlgeschlagen', error);
                  }
                  showToastMessage('Speichern abgebrochen');
                });
              return;
            }
            var success = downloadJson(snapshot, fileName);
            if (success) {
              pushAutosave(snapshot);
              showToastMessage('Ergebnis gespeichert (' + fileName + ').');
            } else {
              showToastMessage('Datei konnte nicht gespeichert werden.');
            }
          }

          function loadFromFile(file) {
            if (!file) {
              return;
            }
            var loadErrorMessage = 'Diese Datei konnte nicht geladen werden. Bitte eine Warenschmiede-Sicherung auswählen.';
            var reader = new FileReader();
            reader.onload = function () {
              try {
                var text = reader.result;
                var parsed = JSON.parse(text);
                var migrated = migrateIfNeeded(parsed);
                if (!migrated) {
                  throw new Error('Ungültige Daten');
                }
                applyState(migrated);
                var displayName = file && file.name ? file.name : 'Datei';
                showToastMessage('Geladen: ' + displayName);
              } catch (error) {
                console.error('Laden der Kalkulation fehlgeschlagen', error);
                showToastMessage(loadErrorMessage);
              }
            };
            reader.onerror = function () {
              showToastMessage(loadErrorMessage);
            };
            reader.readAsText(file);
          }

          standardPersistence = createPersistenceController('std', {
            checkbox: rememberStandardToggle,
            collect: function () {
              return { values: collectInputValues(calcInputs) };
            },
            apply: function (payload) {
              loadedStandardPayload = payload;
              var values = payload && payload.values ? payload.values : null;
              if (!values) {
                return;
              }
              suppressCalcEvent = true;
              try {
                applyInputValues(calcInputs, values);
              } finally {
                suppressCalcEvent = false;
              }
              if (pricePerKgInput && values.pricePerKg != null && values.pricePerKg !== '') {
                pricePerKgUserEdited = true;
              }
            }
          });

          proPersistence = createPersistenceController('pro', {
            checkbox: rememberProToggle,
            collect: function () {
              return {
                values: collectInputValues(proCalcInputs),
                proEnabled: proToggle ? !!proToggle.checked : false
              };
            },
            onEnable: function () {
              if (proToggle && !proToggle.checked) {
                proToggle.checked = true;
                setProState(true, { skipPersist: true });
              }
            },
            apply: function (payload) {
              loadedProPayload = payload;
              var values = payload && payload.values ? payload.values : null;
              suppressCalcEvent = true;
              try {
                if (values) {
                  applyInputValues(proCalcInputs, values);
                  if (Object.prototype.hasOwnProperty.call(values, 'nozzle') && values.nozzle) {
                    applyLegacyNozzleValue(values.nozzle);
                    schedulePersistenceForTarget(nozzleDiameterSelect, true);
                    schedulePersistenceForTarget(nozzleTypeSelect, true);
                  }
                }
                ensureNozzleDefaults();
              } finally {
                suppressCalcEvent = false;
              }
              if (typeof payload.proEnabled === 'boolean' && proToggle) {
                proToggle.checked = payload.proEnabled;
                setProState(payload.proEnabled, { skipPersist: true, skipRecalc: true });
              }
              if (materialDensityInput && values && values.materialDensity != null && values.materialDensity !== '') {
                materialDensityUserEdited = true;
                materialDensityInput.setAttribute('data-user-set', '1');
              }
              if (machineHourlyInput && values && values.machineHourlyRate != null && values.machineHourlyRate !== '') {
                machineHourlyUserEdited = true;
              }
              getNozzleSelection();
            }
          });

          sellerPersistence = createPersistenceController('seller', {
            checkbox: rememberSellerToggle,
            collect: function () {
              return { values: collectInputValues(sellerFieldElements) };
            },
            apply: function (payload) {
              loadedSellerPayload = payload;
              var values = payload && payload.values ? payload.values : null;
              if (!values) {
                return;
              }
              applyInputValues(sellerFieldElements, values);
              sellerFieldElements.forEach(function (field) {
                validateOfferField(field);
              });
            },
            onClear: function () {
              sellerFieldElements.forEach(function (field) {
                validateOfferField(field);
              });
            }
          });

          customerPersistence = createPersistenceController('customer', {
            checkbox: rememberCustomerToggle,
            collect: function () {
              return { values: collectInputValues(customerFieldElements) };
            },
            apply: function (payload) {
              loadedCustomerPayload = payload;
              var values = payload && payload.values ? payload.values : null;
              if (!values) {
                return;
              }
              applyInputValues(customerFieldElements, values);
              customerFieldElements.forEach(function (field) {
                validateOfferField(field);
              });
            },
            onClear: function () {
              customerFieldElements.forEach(function (field) {
                validateOfferField(field);
              });
            }
          });

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

          function handleOfferFieldInput(field, immediate) {
            if (!field) {
              return;
            }
            validateOfferField(field);
            var offerKey = field.getAttribute('data-offer-field') || '';
            if (offerKey) {
              var rawValue = field.value != null ? field.value.toString() : '';
              var trimmedValue = rawValue.trim();
              if (offerKey === 'vendorIban') {
                if (trimmedValue) {
                  setStorageItem('ws.company.iban', trimmedValue);
                } else {
                  removeStorageItem('ws.company.iban');
                }
              } else if (offerKey === 'vendorBic') {
                if (trimmedValue) {
                  setStorageItem('ws.company.bic', trimmedValue);
                } else {
                  removeStorageItem('ws.company.bic');
                }
              } else if (offerKey === 'vendorBankName') {
                if (trimmedValue) {
                  setStorageItem('ws.company.bankname', trimmedValue);
                } else {
                  removeStorageItem('ws.company.bankname');
                }
              }
            }
            schedulePersistenceForTarget(field, immediate);
          }

          function attachOfferFieldListeners() {
            offerFields.forEach(function (field) {
              field.addEventListener('input', function () {
                handleOfferFieldInput(field, false);
              });
              field.addEventListener('change', function () {
                handleOfferFieldInput(field, true);
              });
              field.addEventListener('blur', function () {
                var trimmed = field.value != null ? field.value.toString().trim() : '';
                field.value = trimmed;
                handleOfferFieldInput(field, true);
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
            setOfferDefaults();
            attachOfferFieldListeners();
            applyStoredBankData();
            offerFields.forEach(function (field) {
              validateOfferField(field);
            });
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
            var hasLoaded = !!(loadedStandardPayload || loadedProPayload || loadedSellerPayload || loadedCustomerPayload);
            if (hasLoaded) {
              triggerRecalc({ immediate: true });
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

          function setInvoiceMetaItem(key, value) {
            if (!printInvoiceMetaItems || !printInvoiceMetaValues) {
              return false;
            }
            var item = printInvoiceMetaItems[key];
            var valueElement = printInvoiceMetaValues[key];
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
            var invoice = state.invoice || {};
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
            setOfferPrintRow('vendorIban', vendor.iban);
            setOfferPrintRow('vendorBic', vendor.bic);
            setOfferPrintRow('vendorBankName', vendor.bankName);
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
            var invoiceVisible = false;
            invoiceVisible = setInvoiceMetaItem('number', invoice.number) || invoiceVisible;
            invoiceVisible = setInvoiceMetaItem('date', formatOfferDateDisplay(invoice.date)) || invoiceVisible;
            invoiceVisible = setInvoiceMetaItem('service', formatOfferDateDisplay(invoice.serviceDate)) || invoiceVisible;
            if (printInvoiceMetaContainer) {
              printInvoiceMetaContainer.hidden = !invoiceVisible;
            }
          }

          function updateOfferPrintExtras(state) {
            if (!state) {
              return;
            }
            if (printOfferNetValue) {
              printOfferNetValue.textContent = formatter.format(state.net);
            }
            var vatAmount = state.vatIncluded ? Math.max(state.gross - state.net, 0) : 0;
            if (printOfferVatValue) {
              printOfferVatValue.textContent = formatter.format(vatAmount);
            }
            if (printOfferVatRow) {
              var showVat = state.vatIncluded && vatAmount > 0.0005;
              printOfferVatRow.hidden = !showVat;
              printOfferVatRow.setAttribute('aria-hidden', showVat ? 'false' : 'true');
            }
            if (printOfferGrossValue) {
              printOfferGrossValue.textContent = formatter.format(state.gross);
            }
            var offerDescription = state.hasPartName ? state.partName : '3D-Druck gemäß Spezifikation';
            if (printOfferDescription) {
              printOfferDescription.textContent = offerDescription;
            }
            if (printOfferQuantity) {
              printOfferQuantity.textContent = '1';
            }
            var offerLineAmount = state.net;
            if (printOfferUnitPrice) {
              printOfferUnitPrice.textContent = formatter.format(offerLineAmount);
            }
            if (printOfferLineTotal) {
              printOfferLineTotal.textContent = formatter.format(offerLineAmount);
            }
            var offerMeta = state.offer && state.offer.meta ? state.offer.meta : {};
            if (printOfferDeliveryInline) {
              var deliveryText = offerMeta.deliveryTime != null ? offerMeta.deliveryTime.toString().trim() : '';
              printOfferDeliveryInline.textContent = deliveryText || '–';
            }
            if (printOfferPaymentInline) {
              var paymentText = offerMeta.paymentTerms != null ? offerMeta.paymentTerms.toString().trim() : '';
              printOfferPaymentInline.textContent = paymentText || '–';
            }
            if (printOfferNoteCard && printOfferNoteValue) {
              var note = state.notes && state.notes.offer ? state.notes.offer.toString().trim() : '';
              if (note) {
                printOfferNoteValue.textContent = note;
                printOfferNoteCard.hidden = false;
                printOfferNoteCard.setAttribute('aria-hidden', 'false');
              } else {
                printOfferNoteValue.textContent = '';
                printOfferNoteCard.hidden = true;
                printOfferNoteCard.setAttribute('aria-hidden', 'true');
              }
            }
          }

          function parseDateValue(value) {
            if (!value) {
              return null;
            }
            var trimmed = value.toString().trim();
            if (!trimmed) {
              return null;
            }
            var parsed = new Date(trimmed);
            if (Number.isNaN(parsed.getTime())) {
              return null;
            }
            return parsed;
          }

          function resolveDueDateText(paymentTerms, invoiceDateValue, fallbackDateValue) {
            if (!paymentTerms) {
              return '';
            }
            var raw = paymentTerms.toString().trim();
            if (!raw) {
              return '';
            }
            var isoMatch = raw.match(/\d{4}-\d{2}-\d{2}/);
            if (isoMatch && isoMatch[0]) {
              return formatOfferDateDisplay(isoMatch[0]);
            }
            var euMatch = raw.match(/\d{1,2}\.\d{1,2}\.\d{4}/);
            if (euMatch && euMatch[0]) {
              return euMatch[0];
            }
            var daysMatch = raw.match(/(\d{1,3})\s*(?:tage|tagen|tag|t|d)\b/i);
            if (daysMatch && daysMatch[1]) {
              var daysValue = parseInt(daysMatch[1], 10);
              if (Number.isFinite(daysValue) && daysValue >= 0) {
                var baseDate = parseDateValue(invoiceDateValue) || parseDateValue(fallbackDateValue) || new Date();
                var dueDate = new Date(baseDate.getTime());
                dueDate.setDate(dueDate.getDate() + daysValue);
                return offerDateFormatter.format(dueDate);
              }
            }
            return '';
          }

          function updateInvoicePrintExtras(state) {
            if (!state) {
              return;
            }
            var netAmount = state.net;
            var grossAmount = state.gross;
            var vatAmount = state.vatIncluded ? Math.max(grossAmount - netAmount, 0) : 0;
            var descriptionText = state.hasPartName ? state.partName : '3D-Druck gemäß Spezifikation';
            if (printInvoiceDescription) {
              printInvoiceDescription.textContent = descriptionText;
            }
            if (printInvoiceQuantity) {
              printInvoiceQuantity.textContent = '1';
            }
            if (printInvoiceUnitPrice) {
              printInvoiceUnitPrice.textContent = formatter.format(netAmount);
            }
            if (printInvoiceNetValue) {
              printInvoiceNetValue.textContent = formatter.format(netAmount);
            }
            if (printInvoiceSubtotal) {
              printInvoiceSubtotal.textContent = formatter.format(netAmount);
            }
            if (printInvoiceVat) {
              printInvoiceVat.textContent = formatter.format(vatAmount);
            }
            if (printInvoiceVatRow) {
              var showVatRow = state.vatIncluded && vatAmount > 0.0005;
              printInvoiceVatRow.hidden = !showVatRow;
              printInvoiceVatRow.setAttribute('aria-hidden', showVatRow ? 'false' : 'true');
            }
            if (printInvoiceGross) {
              printInvoiceGross.textContent = formatter.format(grossAmount);
            }
            if (printInvoiceVatNote) {
              if (state.vatIncluded) {
                printInvoiceVatNote.textContent = '';
                printInvoiceVatNote.hidden = true;
                printInvoiceVatNote.setAttribute('aria-hidden', 'true');
              } else {
                printInvoiceVatNote.textContent = 'Gemäß § 19 UStG wird keine Umsatzsteuer ausgewiesen.';
                printInvoiceVatNote.hidden = false;
                printInvoiceVatNote.setAttribute('aria-hidden', 'false');
              }
            }
            var offerMeta = state.offer && state.offer.meta ? state.offer.meta : {};
            var invoiceInfo = state.offer && state.offer.invoice ? state.offer.invoice : {};
            var dueText = resolveDueDateText(offerMeta.paymentTerms || '', invoiceInfo.date, offerMeta.date);
            var isPaid = markInvoicePaidCheckbox ? !!markInvoicePaidCheckbox.checked : false;
            if (printInvoicePaidLine) {
              if (isPaid) {
                var paidRaw = paidDateInput ? paidDateInput.value : '';
                var paidDisplay = formatOfferDateDisplay(paidRaw);
                if (printInvoicePaidDate) {
                  printInvoicePaidDate.textContent = paidDisplay || '–';
                }
                printInvoicePaidLine.hidden = false;
                printInvoicePaidLine.setAttribute('aria-hidden', 'false');
              } else {
                printInvoicePaidLine.hidden = true;
                printInvoicePaidLine.setAttribute('aria-hidden', 'true');
                if (printInvoicePaidDate) {
                  printInvoicePaidDate.textContent = '–';
                }
              }
            }
            if (printInvoiceDueLine) {
              if (!isPaid && dueText) {
                if (printInvoiceDueDate) {
                  printInvoiceDueDate.textContent = dueText;
                }
                printInvoiceDueLine.hidden = false;
                printInvoiceDueLine.setAttribute('aria-hidden', 'false');
              } else {
                printInvoiceDueLine.hidden = true;
                printInvoiceDueLine.setAttribute('aria-hidden', 'true');
                if (printInvoiceDueDate) {
                  printInvoiceDueDate.textContent = '–';
                }
              }
            }
            if (printInvoicePaymentContainer) {
              var hasPaymentInfo = false;
              if (printInvoicePaidLine && !printInvoicePaidLine.hidden) {
                hasPaymentInfo = true;
              }
              if (printInvoiceDueLine && !printInvoiceDueLine.hidden) {
                hasPaymentInfo = true;
              }
              printInvoicePaymentContainer.hidden = !hasPaymentInfo;
              printInvoicePaymentContainer.setAttribute('aria-hidden', hasPaymentInfo ? 'false' : 'true');
            }
            if (printInvoiceNoteCard && printInvoiceNoteValue) {
              var invoiceNote = state.notes && state.notes.invoice ? state.notes.invoice.toString().trim() : '';
              if (invoiceNote) {
                printInvoiceNoteValue.textContent = invoiceNote;
                printInvoiceNoteCard.hidden = false;
                printInvoiceNoteCard.setAttribute('aria-hidden', 'false');
              } else {
                printInvoiceNoteValue.textContent = '';
                printInvoiceNoteCard.hidden = true;
                printInvoiceNoteCard.setAttribute('aria-hidden', 'true');
              }
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
            var nozzleSelection = getNozzleSelection();
            var noteRawValue = getInputRaw(proNoteInput);

            var materialDensityValue = readNumber(materialDensityInput);
            var nozzleValue = nozzleSelection.combined;
            var noteNormalized = noteRawValue ? noteRawValue.slice(0, 300) : '';
            noteNormalized = noteNormalized.replace(/\r\n/g, '\n');
            var noteTrimmed = noteNormalized.trim();
            var noteValue = noteTrimmed ? noteTrimmed : '';
            var offerNoteRaw = offerNoteInput && offerNoteInput.value != null ? offerNoteInput.value.toString() : '';
            var invoiceNoteRaw = invoiceNoteInput && invoiceNoteInput.value != null ? invoiceNoteInput.value.toString() : '';
            var offerNoteTrimmed = offerNoteRaw.trim();
            var invoiceNoteTrimmed = invoiceNoteRaw.trim();
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
              materialDensity: proEnabled ? materialDensityValue : 0,
              nozzle: nozzleValue,
              nozzleDiameter: nozzleSelection.diameter,
              nozzleType: nozzleSelection.type,
              note: noteValue
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
                machineLifetime: machineLifetime,
                nozzle: nozzleValue,
                nozzleDiameter: nozzleSelection.diameter,
                nozzleType: nozzleSelection.type,
                note: noteValue
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
              materialDensity: proEnabled && materialDensityValue > 0,
              materialNozzle: nozzleValue.length > 0,
              note: noteValue.length > 0
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
              offer: offerState,
              notes: {
                offer: offerNoteTrimmed,
                invoice: invoiceNoteTrimmed
              }
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
              energyCostLabelOutput.textContent = 'Energie';
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
              fixedCostOutput.textContent = '+\u00A0' + formatter.format(state.pro.fixedCost);
            }

            if (subtotalOutput) {
              var subtotalValue = state.pro.enabled ? state.pro.subtotal : state.standardSubtotal;
              subtotalOutput.textContent = formatter.format(subtotalValue);
            }

            if (marginOutput) {
              marginOutput.textContent = '+\u00A0' + formatter.format(state.pro.marginValue);
            }

            if (discountOutput) {
              discountOutput.textContent = '\u2013\u00A0' + formatter.format(state.pro.discountValue);
            }

            if (vatNoteOutput) {
              var vatVisible = !state.vatIncluded;
              vatNoteOutput.hidden = !vatVisible;
              vatNoteOutput.setAttribute('aria-hidden', (!vatVisible).toString());
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
            updateOfferPrintExtras(state);
            updateInvoicePrintExtras(state);

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
              printFixedCostOutput.textContent = '+\u00A0' + formatter.format(state.pro.fixedCost);
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
            if (printNozzleOutput) {
              if (state.pro.nozzle) {
                printNozzleOutput.textContent = state.pro.nozzle;
              } else {
                printNozzleOutput.textContent = '–';
              }
            }
            if (printErrorRateOutput) {
              printErrorRateOutput.textContent = percentNumberFormatter.format(state.pro.materialErrorPercent) + '\u00A0%';
            }
            if (printSubtotalOutput) {
              var subtotalValue = state.pro.enabled ? state.pro.subtotal : state.standardSubtotal;
              printSubtotalOutput.textContent = formatter.format(subtotalValue);
            }
            if (printMarginOutput) {
              printMarginOutput.textContent = '+\u00A0' + formatter.format(state.pro.marginValue);
            }
            if (printDiscountOutput) {
              printDiscountOutput.textContent = '\u2013\u00A0' + formatter.format(state.pro.discountValue);
            }

            var hasTime = state.pro.enabled && hasValue(state.pro.timeCost);
            var hasMachine = state.pro.enabled && hasValue(state.pro.machineCost);
            var hasFixed = state.pro.enabled && hasValue(state.pro.fixedCost);
            var hasMargin = state.pro.enabled && hasValue(state.pro.marginValue);
            var hasDiscount = state.pro.enabled && hasValue(state.pro.discountValue);

            setRowVisibility(printSummaryItemTime, hasTime);
            setRowVisibility(printSummaryItemMachine, hasMachine);
            setRowVisibility(printSummaryItemFixed, hasFixed);
            setRowVisibility(printSummaryItemMargin, hasMargin);
            setRowVisibility(printSummaryItemDiscount, hasDiscount);

            var hasAdjustments = hasMargin || hasFixed || hasDiscount;
            setSectionVisibility(printAdjustmentsGroup, state.pro.enabled && hasAdjustments);
            setSectionVisibility(printAdjustmentsSeparator, state.pro.enabled && hasAdjustments);

            printNetOutput.textContent = formatter.format(state.net);
            printGrossOutput.textContent = formatter.format(state.gross);

            var highlightValue = state.vatIncluded ? state.gross : state.net;
            printTotalOutput.textContent = formatter.format(highlightValue);

            if (printTotalContextOutput) {
              printTotalContextOutput.textContent = state.vatIncluded ? ' (inkl. MwSt.)' : ' (netto)';
            }

            if (printVatNoteOutput) {
              if (state.vatIncluded) {
                printVatNoteOutput.textContent = '';
                printVatNoteOutput.hidden = true;
                printVatNoteOutput.setAttribute('aria-hidden', 'true');
              } else {
                printVatNoteOutput.textContent = 'Hinweis: §19 UStG – keine Umsatzsteuer.';
                printVatNoteOutput.hidden = false;
                printVatNoteOutput.setAttribute('aria-hidden', 'false');
              }
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
                materialDensity: state.inputs.materialDensity,
                materialNozzle: state.inputs.materialNozzle
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
                setRowVisibility(printProInputRows.materialNozzle, !!proVisibility.materialNozzle);

                var hasVisibleProRow = Object.keys(proVisibility).some(function (key) {
                  return !!proVisibility[key];
                });
                printProParamsSection.hidden = !hasVisibleProRow;
              } else {
                printProParamsSection.hidden = true;
              }
            }

            if (printNoteCard && printNoteValue) {
              var hasNote = !!state.pro.note && state.pro.note.length > 0;
              if (hasNote) {
                printNoteValue.textContent = state.pro.note;
                printNoteCard.hidden = false;
                printNoteCard.setAttribute('aria-hidden', 'false');
              } else {
                printNoteValue.textContent = '';
                printNoteCard.hidden = true;
                printNoteCard.setAttribute('aria-hidden', 'true');
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
            var discountInvalid = isDiscountInvalid();
            setDiscountValidity(!discountInvalid);
            if (discountInvalid) {
              return lastValidState;
            }
            var state = computeState();
            lastValidState = state;
            updateResults(state);
            updatePrintSummary(state);
            return state;
          }

          initializeOfferSection();
          initializeDocumentNotes();
          syncPaidControls();
          clearInvoiceError();
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
              if (hasPrice) {
                schedulePersistenceForTarget(pricePerKgInput, true);
              }
              if (hasDensity && materialDensityInput) {
                schedulePersistenceForTarget(materialDensityInput, true);
              }

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
              schedulePersistenceForTarget(materialDensityInput, true);
              if (proModeEnabled && !materialDensityInput.disabled) {
                materialDensityInput.focus();
              }
            });
          }

          if (saveButtons && saveButtons.length) {
            saveButtons.forEach(function (button) {
              button.addEventListener('click', function (event) {
                if (event && typeof event.preventDefault === 'function') {
                  event.preventDefault();
                }
                saveCurrent();
              });
            });
          }

          if (loadButtons && loadButtons.length) {
            loadButtons.forEach(function (button) {
              button.addEventListener('click', function (event) {
                if (event && typeof event.preventDefault === 'function') {
                  event.preventDefault();
                }
                if (fileLoadInput) {
                  fileLoadInput.click();
                }
              });
            });
          }

          if (fileLoadInput) {
            fileLoadInput.addEventListener('change', function (event) {
              var target = event ? event.target : null;
              if (target && target.files && target.files[0]) {
                loadFromFile(target.files[0]);
              }
              if (target) {
                target.value = '';
              }
            });
          }

          if (proToggle) {
            proToggle.addEventListener('change', function () {
              setProState(proToggle.checked);
            });
          }

          if (markInvoicePaidCheckbox) {
            markInvoicePaidCheckbox.addEventListener('change', function () {
              syncPaidControls();
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
            setDocumentPrintMode(null);
            clearInvoiceError();
            if (pendingPrintTitle !== null) {
              document.title = originalDocumentTitle;
              pendingPrintTitle = null;
            }
          });

          function persistPrintPayloadForSession(target) {
            if (!target) {
              throw new Error('Druckziel nicht definiert.');
            }
            if (!lastValidState) {
              throw new Error('Bitte zuerst eine Berechnung durchführen.');
            }
            var serialized = serializeCurrentState();
            if (!serialized) {
              throw new Error('Keine Daten für die Druckansicht verfügbar.');
            }
            var session = safeStorage('sessionStorage');
            if (!session) {
              throw new Error('Druckdaten konnten nicht zwischengespeichert werden.');
            }
            try {
              var key = [
                target,
                Date.now().toString(36),
                Math.random().toString(36).slice(2, 8)
              ].join('-');
              session.setItem(PRINT_STORAGE_PREFIX + key, serialized);
              return key;
            } catch (error) {
              throw new Error('Druckdaten konnten nicht zwischengespeichert werden.');
            }
          }

          buildOfferUrl = function () {
            clearInvoiceError();
            try {
              var key = persistPrintPayloadForSession('offer');
              return '/druck/angebot.html?' + PRINT_STORAGE_PARAM + '=' + encodeURIComponent(key);
            } catch (error) {
              console.error('buildOfferUrl error', error);
              window.alert(error && error.message ? error.message : 'Druckansicht konnte nicht geöffnet werden.');
              return '';
            }
          };

          buildInvoiceUrl = function () {
            if (!ensureInvoicePrintable()) {
              return '';
            }
            try {
              var key = persistPrintPayloadForSession('invoice');
              return '/druck/rechnung.html?' + PRINT_STORAGE_PARAM + '=' + encodeURIComponent(key);
            } catch (error) {
              console.error('buildInvoiceUrl error', error);
              window.alert(error && error.message ? error.message : 'Druckansicht konnte nicht geöffnet werden.');
              return '';
            }
          };

          ensureNozzleDefaults();
          getNozzleSelection();
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
