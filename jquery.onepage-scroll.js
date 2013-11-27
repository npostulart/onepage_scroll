(function() {
  jQuery(function($) {
    $.onepage_scroll = function(element, options) {
      this.settings = {};
      this.$element = $(element);
      this.transformPage = function(index) {
        var pos,
          _this = this;
        pos = ((index - 1) * 100) * -1;
        if (!this.supportTransition()) {
          this.$element.animate({
            top: "" + pos + "%"
          }, function() {
            return _this.settings.afterMove(index);
          });
        } else {
          this.$element.css({
            "transform": "translate3d(0, " + pos + "%, 0)",
            "transition": "all " + this.settings.animationTime + "ms " + this.settings.easing,
            "-webkit-transform": "translate3d(0, " + pos + "%, 0)",
            "-webkit-transition": "all " + this.settings.animationTime + "ms " + this.settings.easing
          });
          this.$element.one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function() {
            return _this.settings.afterMove(index);
          });
        }
        return this;
      };
      this.moveDown = function() {
        var index;
        index = $("" + this.settings.sectionContainer + ".active").data("index");
        return this.moveTo(index + 1);
      };
      this.moveUp = function() {
        var index;
        index = $("" + this.settings.sectionContainer + ".active").data("index");
        return this.moveTo(index - 1);
      };
      this.moveTo = function(page_index) {
        var current, next;
        current = $("" + this.settings.sectionContainer + ".active");
        if (page_index < 1 || page_index > this.total) {
          if (this.settings.loop) {
            page_index = page_index < 1 ? this.total : 1;
          } else {
            return;
          }
        }
        next = $("" + this.settings.sectionContainer + "[data-index='" + page_index + "']");
        this.settings.beforeMove(current.data("index"));
        current.removeClass("active");
        next.addClass("active");
        if (this.settings.pagination) {
          $(".onepage-pagination li a.active").removeClass("active");
          $(".onepage-pagination li a[data-index='" + page_index + "']").addClass("active");
        }
        $("body").removeClass("viewing-page-" + (current.data("index"))).addClass("viewing-page-" + (next.data("index")));
        if (this.settings.updateURL) {
          this.updateHistory(page_index);
        }
        return this.transformPage(page_index);
      };
      this.updateHistory = function(index) {
        var href;
        if (history.replaceState) {
          href = window.location.href.substr(0, "" + (window.location.href.indexOf('#')) + "#" + index);
          history.pushState({}, document.title, href);
        }
        return this;
      };
      this.responsive = function() {
        var _this = this;
        if ($(window).width() < this.settings.responsiveFallback) {
          $("body").addClass("disabled-onepage-scroll");
          $(document).unbind("mousewheel DOMMouseScroll");
          this.$element.hammer().unbind("swipeup.onepage swipedown.onepage");
        } else {
          if ($("body").hasClass("disabled-onepage-scroll")) {
            $("body").removeClass("disabled-onepage-scroll");
            $("html, body, .wrapper").animate({
              scrollTop: 0
            }, "fast");
          }
          this.$element.hammer().on('swipedown.onepage', function(e) {
            if ($("body").hasClass("disabled-onepage-scroll")) {
              return;
            }
            e.preventDefault();
            e.gesture.preventDefault();
            return _this.moveUp();
          }).on('swipeup.onepage', function(e) {
            if ($("body").hasClass("disabled-onepage-scroll")) {
              return;
            }
            e.preventDefault();
            e.gesture.preventDefault();
            return _this.moveDown();
          });
          $(document).bind('mousewheel.onepage DOMMouseScroll.onepage', function(e) {
            var delta;
            e.preventDefault();
            delta = e.originalEvent.wheelDelta || -e.originalEvent.detail;
            return _this.init_scroll(e, delta);
          });
        }
        return this;
      };
      this.init_scroll = function(e, delta) {
        var deltaOfInterest, timeNow;
        deltaOfInterest = delta;
        timeNow = new Date().getTime();
        if (timeNow - this.lastAnimation < this.quietPeriod + this.settings.animationTime) {
          e.preventDefault();
          return;
        }
        if (deltaOfInterest < 0) {
          this.moveDown();
        } else {
          this.moveUp();
        }
        this.lastAnimation = timeNow;
        return this;
      };
      this.bindPagination = function() {
        var _this = this;
        $(".onepage-pagination li a").on('click.onepage', function(e) {
          var page_index;
          page_index = $(e.currentTarget).data("index");
          return _this.moveTo(page_index);
        });
        return this;
      };
      this.supportTransition = function() {
        return Modernizr.csstransitions && Modernizr.csstransforms3d;
      };
      this.init = function() {
        var init_index, posTop, topPos,
          _this = this;
        this.settings = $.extend({}, this.defaults, options);
        this.sections = $(this.settings.sectionContainer);
        this.total = this.sections.length;
        this.lastAnimation = 0;
        this.quietPeriod = 500;
        this.paginationList = "";
        this.$element.addClass("onepage-wrapper").css("position", "relative");
        topPos = 0;
        $.each(this.sections, function(i, elem) {
          $(elem).addClass("section").attr("data-index", i + 1).css({
            position: "absolute",
            top: "" + topPos + "%"
          });
          topPos += 100;
          if (_this.settings.pagination) {
            return _this.paginationList += "<li><a data-index='" + (i + 1) + "' href='#" + (i + 1) + "'></a></li>";
          }
        });
        $(document).bind('mousewheel.onepage DOMMouseScroll.onepage', function(e) {
          var delta;
          e.preventDefault();
          delta = e.originalEvent.wheelDelta || -e.originalEvent.detail;
          if (!$("body").hasClass("disabled-onepage-scroll")) {
            return _this.init_scroll(e, delta);
          }
        });
        if (this.settings.pagination) {
          $("<ul class='onepage-pagination'>" + this.paginationList + "</ul>").prependTo("body");
          posTop = (this.$element.find(".onepage-pagination").height() / 2) * -1;
          this.$element.find(".onepage-pagination").css("margin-top", posTop);
        }
        $("" + this.settings.sectionContainer + "[data-index='1']").addClass("active");
        $("body").addClass("viewing-page-1");
        if (this.settings.pagination) {
          $(".onepage-pagination li a[data-index='1']").addClass("active");
        }
        $(window).scrollTop(0);
        if (window.location.hash !== "" && window.location.hash !== "#1") {
          init_index = window.location.hash.replace("#", "");
          this.moveTo(init_index);
        }
        if (this.settings.pagination) {
          this.bindPagination();
        }
        if (this.settings.responsiveFallback !== false) {
          $(window).resize(function() {
            return _this.responsive();
          });
          this.responsive();
        } else {
          this.$element.hammer().on('swipedown.onepage', function(e) {
            if ($("body").hasClass("disabled-onepage-scroll")) {
              return;
            }
            e.preventDefault();
            return _this.moveUp(_this.$element);
          }).on('swipeup.onepage', function(e) {
            if ($("body").hasClass("disabled-onepage-scroll")) {
              return;
            }
            e.preventDefault();
            return _this.moveDown(_this.$element);
          });
        }
        if (this.settings.keyboard) {
          $(document).on('keydown.onepage', function(e) {
            var tag;
            tag = e.target.nodeName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || $("body").hasClass("disabled-onepage-scroll")) {
              return;
            }
            switch (e.which) {
              case 33:
              case 38:
                _this.moveUp();
                break;
              case 34:
              case 40:
                _this.moveDown();
                break;
              case 36:
                _this.moveTo(1);
                break;
              case 35:
                _this.moveTo(_this.total);
                break;
              default:
                return;
            }
            return e.preventDefault();
          });
        }
        return this;
      };
      this.init();
      return this;
    };
    $.onepage_scroll.prototype.defaults = {
      sectionContainer: "section",
      easing: "ease",
      animationTime: 1000,
      pagination: true,
      keyboard: false,
      updateURL: false,
      beforeMove: $.noop,
      afterMove: $.noop,
      loop: false,
      responsiveFallback: false
    };
    return $.fn.onepage_scroll = function(options) {
      return this.each(function() {
        var plugin;
        if ($(this).data('onepage_scroll') === void 0) {
          plugin = new $.onepage_scroll(this, options);
          return $(this).data('onepage_scroll', plugin);
        } else {
          return $(this).data('onepage_scroll');
        }
      });
    };
  });

}).call(this);

/*
//@ sourceMappingURL=jquery.onepage-scroll.js.map
*/