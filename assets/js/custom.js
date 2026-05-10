(function ($) {
	
	"use strict";

	// Page loading animation
	$(window).on('load', function() {

        $('#js-preloader').addClass('loaded');

    });


	$(window).scroll(function() {
	  var scroll = $(window).scrollTop();
	  var box = $('.header-text').height();
	  var header = $('header').height();

	  if (scroll >= box - header) {
	    $("header").addClass("background-header");
	  } else {
	    $("header").removeClass("background-header");
	  }
	})

	var width = $(window).width();
		$(window).resize(function() {
		if (width > 767 && $(window).width() < 767) {
			location.reload();
		}
		else if (width < 767 && $(window).width() > 767) {
			location.reload();
		}
	})

	// Menu Dropdown Toggle
	if($('.menu-trigger').length){
		$(".menu-trigger").on('click', function() {	
			$(this).toggleClass('active');
			$('.header-area .nav').slideToggle(200);
		});
	}


	// Menu elevator animation
	$('.scroll-to-section a[href*=\\#]:not([href=\\#]):not([data-bs-toggle])').on('click', function() {
		if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
			var target = $(this.hash);
			target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
			if (target.length) {
				var width = $(window).width();
				if(width < 991) {
					$('.menu-trigger').removeClass('active');
					$('.header-area .nav').slideUp(200);	
				}				
				$('html,body').animate({
					scrollTop: (target.offset().top) - 76
				}, 700);
				return false;
			}
		}
	});


	// Reservation calendar → contact form
	(function initReservationWidget() {
		var root = document.getElementById('reservationWidget');
		if (!root) return;

		var stepCal = document.getElementById('reservationCalendarStep');
		var stepContact = document.getElementById('reservationContactStep');
		var grid = document.getElementById('resCalGrid');
		var titleEl = document.getElementById('resCalTitle');
		var summaryDates = document.getElementById('resSummaryDates');
		var form = document.getElementById('reservationContactForm');
		var doneMsg = document.getElementById('reservationDone');
		var inpFrom = document.getElementById('resDateFrom');
		var inpTo = document.getElementById('resDateTo');

		var monthNames = ['Janvāris', 'Februāris', 'Marts', 'Aprīlis', 'Maijs', 'Jūnijs', 'Jūlijs', 'Augusts', 'Septembris', 'Oktobris', 'Novembris', 'Decembris'];

		var viewYear, viewMonth;
		var selStart = null;
		var selEnd = null;

		function startOfToday() {
			var t = new Date();
			t.setHours(0, 0, 0, 0);
			return t;
		}

		function stripTime(d) {
			var x = new Date(d);
			x.setHours(0, 0, 0, 0);
			return x;
		}

		function sameDay(a, b) {
			return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
		}

		function daysInMonth(y, m) {
			return new Date(y, m + 1, 0).getDate();
		}

		function mondayFirstWeekday(year, month) {
			var d = new Date(year, month, 1);
			var w = d.getDay();
			return w === 0 ? 6 : w - 1;
		}

		function toYMD(d) {
			var y = d.getFullYear();
			var m = String(d.getMonth() + 1).padStart(2, '0');
			var day = String(d.getDate()).padStart(2, '0');
			return y + '-' + m + '-' + day;
		}

		function fmtLV(d) {
			return d.toLocaleDateString('lv-LV', { day: 'numeric', month: 'long', year: 'numeric' });
		}

		function goContact() {
			summaryDates.textContent = fmtLV(selStart) + ' — ' + fmtLV(selEnd);
			stepCal.hidden = true;
			stepContact.hidden = false;
			doneMsg.setAttribute('hidden', 'hidden');
			form.removeAttribute('hidden');
			form.reset();
			inpFrom.value = toYMD(selStart);
			inpTo.value = toYMD(selEnd);
		}

		function goCalendar() {
			var n = new Date();
			viewYear = n.getFullYear();
			viewMonth = n.getMonth();
			selStart = null;
			selEnd = null;
			stepCal.hidden = false;
			stepContact.hidden = true;
			doneMsg.setAttribute('hidden', 'hidden');
			form.removeAttribute('hidden');
			form.reset();
			render();
		}

		function chooseDay(dayDate) {
			var t0 = startOfToday();
			if (stripTime(dayDate) < t0) return;

			if (!selStart || (selStart && selEnd)) {
				selStart = dayDate;
				selEnd = null;
				render();
				return;
			}

			if (selStart && !selEnd) {
				if (stripTime(dayDate) < stripTime(selStart)) {
					selStart = dayDate;
					render();
				} else {
					selEnd = dayDate;
					render();
					setTimeout(goContact, 200);
				}
			}
		}

		function render() {
			titleEl.textContent = monthNames[viewMonth] + ' ' + viewYear;
			grid.innerHTML = '';
			var pad = mondayFirstWeekday(viewYear, viewMonth);
			var dim = daysInMonth(viewYear, viewMonth);
			var today = startOfToday();
			var i;
			for (i = 0; i < pad; i++) {
				var padEl = document.createElement('div');
				padEl.className = 'reservation-cal-pad';
				grid.appendChild(padEl);
			}
			for (var day = 1; day <= dim; day++) {
				var d = new Date(viewYear, viewMonth, day, 12, 0, 0, 0);
				var btn = document.createElement('button');
				btn.type = 'button';
				btn.className = 'reservation-cal-day';
				btn.textContent = String(day);
				if (stripTime(d) < today) {
					btn.disabled = true;
				}
				if (selStart && selEnd) {
					var a = stripTime(selStart);
					var b = stripTime(selEnd);
					if (stripTime(d) >= a && stripTime(d) <= b) btn.classList.add('in-range');
				}
				if (selStart && sameDay(d, selStart)) btn.classList.add('is-start');
				if (selEnd && sameDay(d, selEnd)) btn.classList.add('is-end');
				(function (dateVal) {
					btn.addEventListener('click', function () {
						chooseDay(dateVal);
					});
				})(d);
				grid.appendChild(btn);
			}
			var used = pad + dim;
			var rem = used % 7 === 0 ? 0 : 7 - (used % 7);
			for (i = 0; i < rem; i++) {
				var tail = document.createElement('div');
				tail.className = 'reservation-cal-pad';
				grid.appendChild(tail);
			}
		}

		var now = new Date();
		viewYear = now.getFullYear();
		viewMonth = now.getMonth();

		document.getElementById('resCalPrev').addEventListener('click', function () {
			if (viewMonth === 0) {
				viewMonth = 11;
				viewYear--;
			} else viewMonth--;
			render();
		});
		document.getElementById('resCalNext').addEventListener('click', function () {
			if (viewMonth === 11) {
				viewMonth = 0;
				viewYear++;
			} else viewMonth++;
			render();
		});
		document.getElementById('resCalBack').addEventListener('click', goCalendar);

		var formSubmitUrl = 'https://formsubmit.co/ajax/migocity.jelgava@gmail.com';

		form.addEventListener('submit', function (e) {
			e.preventDefault();
			if (!form.checkValidity()) {
				form.reportValidity();
				return;
			}
			var submitBtn = form.querySelector('button[type="submit"]');
			var origLabel = submitBtn ? submitBtn.textContent : '';
			if (submitBtn) {
				submitBtn.disabled = true;
				submitBtn.textContent = 'Sūta…';
			}
			fetch(formSubmitUrl, {
				method: 'POST',
				body: new FormData(form),
				headers: { Accept: 'application/json' }
			})
				.then(function (res) {
					if (!res.ok) throw new Error('submit');
					return res.json().catch(function () {
						return {};
					});
				})
				.then(function () {
					form.setAttribute('hidden', 'hidden');
					doneMsg.removeAttribute('hidden');
					form.reset();
				})
				.catch(function () {
					window.alert('Neizdevās nosūtīt. Lūdzu, mēģiniet vēlreiz vai rakstiet uz migocity.jelgava@gmail.com.');
				})
				.finally(function () {
					if (submitBtn) {
						submitBtn.disabled = false;
						submitBtn.textContent = origLabel;
					}
				});
		});

		var reservationModal = document.getElementById('reservationModal');
		if (reservationModal) {
			reservationModal.addEventListener('show.bs.modal', function () {
				goCalendar();
			});
		}

		render();
	})();

	// Rentals page: offerings carousel (show 3, slide to 4th)
	(function initRentalsOfferingsCarousel() {
		var root = document.getElementById('rentalsOfferingsCarousel');
		if (!root) return;

		var track = document.getElementById('rentalsOfferingsTrack');
		var cells = track.querySelectorAll('.rentals-cards-carousel-cell');
		var prevBtn = root.querySelector('.rentals-cards-nav-prev');
		var nextBtn = root.querySelector('.rentals-cards-nav-next');
		var viewport = root.querySelector('.rentals-cards-carousel-viewport');
		var index = 0;

		function visibleCount() {
			var w = window.innerWidth;
			if (w >= 992) return 3;
			if (w >= 768) return 2;
			return 1;
		}

		function maxIndex() {
			return Math.max(0, cells.length - visibleCount());
		}

		function gapPx() {
			var g = getComputedStyle(track).columnGap || getComputedStyle(track).gap;
			var n = parseFloat(g, 10);
			return isNaN(n) ? 24 : n;
		}

		function cellStepPx() {
			if (!cells.length) return 0;
			var w = cells[0].getBoundingClientRect().width;
			return w + gapPx();
		}

		function layoutCellWidths() {
			var vis = visibleCount();
			var inner = viewport.clientWidth;
			var gap = gapPx();
			var cellW = vis > 0 ? (inner - (vis - 1) * gap) / vis : inner;
			for (var i = 0; i < cells.length; i++) {
				cells[i].style.flexBasis = cellW + 'px';
				cells[i].style.flexShrink = '0';
				cells[i].style.flexGrow = '0';
			}
		}

		function apply() {
			layoutCellWidths();
			track.classList.remove('is-dragging');
			var mi = maxIndex();
			if (index > mi) index = mi;
			var step = cellStepPx();
			track.style.transform = 'translateX(' + Math.round(-index * step) + 'px)';
			prevBtn.disabled = index <= 0;
			nextBtn.disabled = index >= mi;
		}

		prevBtn.addEventListener('click', function () {
			if (index > 0) {
				index--;
				apply();
			}
		});
		nextBtn.addEventListener('click', function () {
			if (index < maxIndex()) {
				index++;
				apply();
			}
		});

		var ro;
		if (typeof ResizeObserver !== 'undefined') {
			ro = new ResizeObserver(function () {
				apply();
			});
			ro.observe(viewport);
		} else {
			window.addEventListener('resize', apply);
		}

		window.addEventListener('load', apply);
		apply();

		// Mobile: swipe + idle auto-advance (single column); arrows hidden in CSS
		var swipeStartX = 0;
		var swipeStartY = 0;
		var swipeStartIndex = 0;
		var swipeAxis = null;
		var swipeStep = 0;
		var swipeMinT = 0;
		var swipeMaxT = 0;
		var offeringsIdleTimer = null;
		var OFFERINGS_IDLE_MS = 3500;
		var offeringsResizeTimer = null;
		var motionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

		function offeringsAutoplayOk() {
			if (visibleCount() !== 1) return false;
			if (document.hidden) return false;
			if (motionQuery && motionQuery.matches) return false;
			return true;
		}

		function clearOfferingsAutoplay() {
			if (offeringsIdleTimer) {
				clearTimeout(offeringsIdleTimer);
				offeringsIdleTimer = null;
			}
		}

		function scheduleOfferingsAutoplay() {
			clearOfferingsAutoplay();
			if (!offeringsAutoplayOk()) return;
			var mi = maxIndex();
			if (mi <= 0) return;
			offeringsIdleTimer = setTimeout(function () {
				offeringsIdleTimer = null;
				if (!offeringsAutoplayOk()) return;
				var mi2 = maxIndex();
				if (index < mi2) index++;
				else index = 0;
				apply();
				scheduleOfferingsAutoplay();
			}, OFFERINGS_IDLE_MS);
		}

		function swipeClampTranslate(t) {
			if (t > swipeMinT) return swipeMinT;
			if (t < swipeMaxT) return swipeMaxT;
			return t;
		}

		function onOfferingsTouchStart(e) {
			clearOfferingsAutoplay();
			if (visibleCount() !== 1) return;
			if (!e.touches || !e.touches.length) return;
			swipeAxis = null;
			swipeStartX = e.touches[0].clientX;
			swipeStartY = e.touches[0].clientY;
			swipeStartIndex = index;
			layoutCellWidths();
			swipeStep = cellStepPx();
			swipeMinT = 0;
			swipeMaxT = -maxIndex() * swipeStep;
		}

		function onOfferingsTouchMove(e) {
			if (visibleCount() !== 1) return;
			if (!e.touches || !e.touches.length) return;
			var x = e.touches[0].clientX;
			var y = e.touches[0].clientY;
			var dx = x - swipeStartX;
			var dy = y - swipeStartY;
			if (swipeAxis === null) {
				if (Math.abs(dx) < 12 && Math.abs(dy) < 12) return;
				if (Math.abs(dx) > Math.abs(dy) * 1.15) swipeAxis = 'h';
				else {
					swipeAxis = 'v';
					return;
				}
			}
			if (swipeAxis !== 'h') return;
			e.preventDefault();
			track.classList.add('is-dragging');
			var base = -swipeStartIndex * swipeStep;
			var t = swipeClampTranslate(base + dx);
			track.style.transform = 'translateX(' + Math.round(t) + 'px)';
		}

		function onOfferingsTouchEnd(e) {
			if (visibleCount() === 1 && swipeAxis === 'h') {
				var tch = e.changedTouches && e.changedTouches[0];
				var endX = tch ? tch.clientX : swipeStartX;
				var dx = endX - swipeStartX;
				swipeAxis = null;
				var threshold = Math.max(48, Math.floor(viewport.clientWidth * 0.15));
				var mi = maxIndex();
				if (dx < -threshold && swipeStartIndex < mi) index = swipeStartIndex + 1;
				else if (dx > threshold && swipeStartIndex > 0) index = swipeStartIndex - 1;
				else index = swipeStartIndex;
				apply();
			} else {
				swipeAxis = null;
			}
			if (visibleCount() === 1) scheduleOfferingsAutoplay();
		}

		viewport.addEventListener('touchstart', onOfferingsTouchStart, { passive: true });
		viewport.addEventListener('touchmove', onOfferingsTouchMove, { passive: false });
		viewport.addEventListener('touchend', onOfferingsTouchEnd, { passive: true });
		viewport.addEventListener('touchcancel', onOfferingsTouchEnd, { passive: true });

		document.addEventListener('visibilitychange', function () {
			if (document.hidden) clearOfferingsAutoplay();
			else scheduleOfferingsAutoplay();
		});

		if (motionQuery && motionQuery.addEventListener) {
			motionQuery.addEventListener('change', function () {
				if (motionQuery.matches) clearOfferingsAutoplay();
				else scheduleOfferingsAutoplay();
			});
		} else if (motionQuery && motionQuery.addListener) {
			motionQuery.addListener(function () {
				if (motionQuery.matches) clearOfferingsAutoplay();
				else scheduleOfferingsAutoplay();
			});
		}

		window.addEventListener('resize', function () {
			clearTimeout(offeringsResizeTimer);
			offeringsResizeTimer = setTimeout(function () {
				if (visibleCount() === 1) scheduleOfferingsAutoplay();
				else clearOfferingsAutoplay();
			}, 200);
		});

		scheduleOfferingsAutoplay();
	})();


})(window.jQuery);