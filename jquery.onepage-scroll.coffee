#
# Name    : <plugin name>
# Author  : <your name>, <your website url>, <twitter handle>
# Version : <version number>
# Repo    : <repo url>
# Website : <website url>
#

jQuery ($) ->

	# Swipe Event handling
#	$.fn.swipeEvents = () ->
#		@.each () ->
#			startX = 0
#			startY = 0
#			$this = $ @
#
#			$this.bind 'touchstart', touchstart
#
#			touchstart = ( e ) ->
#				touches = e.originalEvent.touches
#				if touches and touches.length
#					startX = touches[0].pageX
#					startY = touches[0].pageY
#					$this.bind 'touchmove', touchmove
#
#			touchmove = ( e ) ->
#				touches = e.originalEvent.touches
#				if touches and touches.length
#					deltaX = startX - touches[0].pageX
#					deltaY = startY - touches[0].pageY
#					$this.trigger "swipeLeft" if deltaX >= 50
#					$this.trigger "sipeRight" if deltaX <= -50
#					$this.trigger "swipeUp" if deltaY >= 50
#					$this.trigger "swipeDown" if deltaY <= -50
#					$this.unbind 'touchmove', touchmove if Math.abs(deltaX) >= 50 or Math.abs(deltaY) >= 50


	$.onepage_scroll = ( element, options ) ->
		# current state
#		state = ''

		# plugin settings
		@settings = {}

		# jQuery version of DOM element attached to the plugin
		@$element = $ element

		# set current state
#		@setState = ( _state ) -> state = _state

		#get current state
#		@getState = -> state

		# Scroll Animation
		# afterMove function is called after animation
		@transformPage = ( index ) ->
			pos = ( ( index - 1 ) * 100 ) * -1
			# If Browser doesn't support transitions use jQuery animate
			if not @supportTransition()
				@$element.animate
					top: "#{pos}%"
				, () =>
					@settings.afterMove index
			# Use transform and transition for animation
			else
				@$element.css
					"transform": "translate3d(0, #{pos}%, 0)"
					"transition": "all #{@settings.animationTime}ms #{@settings.easing}"
					"-webkit-transform": "translate3d(0, #{pos}%, 0)"
					"-webkit-transition": "all #{@settings.animationTime}ms #{@settings.easing}"
				@$element.one 'webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', () =>
					@settings.afterMove index
			@

		# Move the page one slide down
		@moveDown = () ->
			index = $("#{@settings.sectionContainer}.active").data("index")
			@moveTo (index + 1)

		# Move the page one slide up
		@moveUp = () ->
			index = $("#{@settings.sectionContainer}.active").data("index")
			@moveTo (index - 1)

		# Move function, moves the page to the defined slide
		@moveTo = ( page_index ) ->
			# get current active element
			current = $("#{@settings.sectionContainer}.active")

			# Check if page_index is outside the slides
			if page_index < 1 or page_index > @total
				# if loop is enabled set the index to the according position
				if @settings.loop
					page_index = if page_index < 1 then @total else 1
				else
					return

			# Get next element
			next = $("#{@settings.sectionContainer}[data-index='#{page_index}']")

			# Call beforeMove callback function
			@settings.beforeMove current.data("index")
			# Set classes of current and next element
			current.removeClass "active"
			next.addClass "active"
			# if pagination is enabled set the correct classes
			if @settings.pagination
				$(".onepage-pagination li a.active").removeClass "active"
				$(".onepage-pagination li a[data-index='#{page_index}']").addClass "active"
			# Set the body class to the currently viewed slide
			$("body").removeClass("viewing-page-#{current.data("index")}").addClass("viewing-page-#{next.data("index")}")

			# Update the Browser URL if enabled
			@updateHistory page_index if @settings.updateURL
			# Call the animation function
			@transformPage page_index

		# Update the history according to the given index
		@updateHistory = ( index ) ->
			# Check if function exists
			if history.replaceState
				href = window.location.href.substr 0, "#{window.location.href.indexOf('#')}##{(index)}"
				history.pushState {}, document.title, href
			@

		# Responsive behaviour
		@responsive = () ->
			# if window smaller than fallback size in settings
			if $(window).width() < @settings.responsiveFallback
				# Add class to body and unbind all events
				$("body").addClass "disabled-onepage-scroll"
				$(document).unbind "mousewheel DOMMouseScroll"
				@$element.hammer().unbind "swipeup.onepage swipedown.onepage"
#				@$element.swipeEvents().unbind("swipeDown swipeUp")
			else
				# Remove disabled class if set and start at top
				if $("body").hasClass "disabled-onepage-scroll"
					$("body").removeClass "disabled-onepage-scroll"
					$("html, body, .wrapper").animate
						scrollTop: 0
					, "fast"

				# Bind swipeDown and swipeUp Events
#				@$element.swipeEvents().bind "swipeDown", (e) =>
				@$element.hammer().on 'swipedown.onepage', (e) =>
					# Do nothing if onepagescroll is disabled
					return if $("body").hasClass "disabled-onepage-scroll"
					e.preventDefault()
					e.gesture.preventDefault()
					@moveUp()
#				.bind "swipeUp", (e) =>
				.on 'swipeup.onepage', (e) =>
					# Do nothing if onepagescroll is disabled
					return if $("body").hasClass "disabled-onepage-scroll"
					e.preventDefault()
					e.gesture.preventDefault()
					@moveDown()

				$(document).bind 'mousewheel.onepage DOMMouseScroll.onepage', (e) =>
					e.preventDefault()
					delta = e.originalEvent.wheelDelta || -e.originalEvent.detail
					@init_scroll e, delta
			@

		# Scroll function
		@init_scroll = ( e, delta ) ->
			deltaOfInterest = delta
			timeNow = new Date().getTime()
			# Cancel scroll if currently animating or within quiet period
			if timeNow - @lastAnimation < @quietPeriod + @settings.animationTime
				e.preventDefault()
				return
			# move up or down according to the delta value
			if deltaOfInterest < 0 then @moveDown() else @moveUp()
			# set last animation time
			@lastAnimation = timeNow
			@

		# Bind pagination events
		@bindPagination = () ->
			$(".onepage-pagination li a").on 'click.onepage', (e) =>
				# get index value from link
				page_index = $(e.currentTarget).data "index"
				@moveTo page_index
			@

		# Returns true if browser supports transitions
		@supportTransition = -> Modernizr.csstransitions and Modernizr.csstransforms3d

		@init = ->
			# Concatenate settings and options
			@settings = $.extend( {}, @defaults, options )

			# All sections
			@sections = $ @settings.sectionContainer
			# Section count
			@total = @sections.length
			# Time of last animation
			@lastAnimation = 0
			# Waittime for next scroll/swipe-Event
			@quietPeriod = 500
			# List of pagination elements
			@paginationList = ""

			# Prepare everything before binding wheel scroll
			@$element.addClass("onepage-wrapper").css("position", "relative")
			# Set css for each section
			topPos = 0
			$.each @sections, ( i, elem ) =>
				$(elem).addClass("section").attr("data-index", i+1).css
					position: "absolute"
					top: "#{topPos}%"
				topPos += 100
				# Add element to paginationlist
				@paginationList += "<li><a data-index='#{i+1}' href='##{i+1}'></a></li>" if @settings.pagination

			# Bind scroll events
			$(document).bind 'mousewheel.onepage DOMMouseScroll.onepage', ( e ) =>
				e.preventDefault()
				delta = e.originalEvent.wheelDelta or -e.originalEvent.detail
				@init_scroll e, delta if not $("body").hasClass "disabled-onepage-scroll"

			# Create pagination
			if @settings.pagination
				$("<ul class='onepage-pagination'>#{@paginationList}</ul>").prependTo "body"
				posTop = (@$element.find(".onepage-pagination").height() / 2) * -1
				@$element.find(".onepage-pagination").css "margin-top", posTop

			# Set first slide active
			$("#{@settings.sectionContainer}[data-index='1']").addClass "active"
			$("body").addClass "viewing-page-1"
			$(".onepage-pagination li a[data-index='1']").addClass "active" if @settings.pagination
			$(window).scrollTop 0

			# Check for url hash
			if window.location.hash isnt "" and window.location.hash isnt "#1"
				init_index = window.location.hash.replace "#", ""
				@moveTo init_index

			# Bind pagination events
			if @settings.pagination
				@bindPagination()

			# Enable responsive Fallback if set
			if @settings.responsiveFallback isnt false
				$(window).resize () =>
					@responsive()
				@responsive()
			else
				# Bind swipeDown and swipeUp events
	#			@$element.swipeEvents().bind "swipeDown", (e) =>
				@$element.hammer().on 'swipedown.onepage', (e) =>
					# Do nothing if onepagescroll disabled
					return if $("body").hasClass "disabled-onepage-scroll"
					e.preventDefault()
					@moveUp @$element
	#			.bind "swipeUp", (e) =>
				.on 'swipeup.onepage', (e) =>
						# Do nothing if onepagescroll disabled
						return if $("body").hasClass "disabled-onepage-scroll"
						e.preventDefault()
						@moveDown @$element

			# Bind keyboard events
			if @settings.keyboard
				$(document).on 'keydown.onepage', ( e ) =>
					tag = e.target.nodeName
					return if tag is 'INPUT' or tag is 'TEXTAREA' or $("body").hasClass "disabled-onepage-scroll"
					switch e.which
						when 33, 38 then @moveUp()
						when 34, 40 then @moveDown()
						when 36 then @moveTo 1
						when 35 then @moveTo @total
						else return
					e.preventDefault()
			@

		# initialise the plugin
		@init()

		# make the plugin chainable
		@

	# default plugin settings
	$.onepage_scroll::defaults =
		sectionContainer: "section" # sectionContainer accepts any kind of selector in case you don't want to use section
		easing: "ease" # Easing options accepts the CSS3 easing animation such "ease", "linear", "ease-in", "ease-out", "ease-in-out", or even cubic bezier value such as "cubic-bezier(0.175, 0.885, 0.420, 1.310)"
		animationTime: 1000 # AnimationTime let you define how long each section takes to animate
		pagination: true # You can either show or hide the pagination. Toggle true for show, false for hide.
		keyboard: false # Should Keyboard navigation be used
		updateURL: false # Toggle this true if you want the URL to be updated automatically when the user scroll to each page.
		beforeMove: $.noop # This option accepts a callback function. The function will be called before the page moves.
		afterMove: $.noop # This option accepts a callback function. The function will be called after the page moves.
		loop: false # You can have the page loop back to the top/bottom when the user navigates at up/down on the first/last page.
		responsiveFallback: false # You can fallback to normal page scroll by defining the width of the browser in which you want the responsive fallback to be triggered. For example, set this to 600 and whenever the browser's width is less than 600, the fallback will kick in.

	$.fn.onepage_scroll = ( options ) ->
		# for each element
		@.each ->
			# bind plugin only if not set
			if $(@).data( 'onepage_scroll' ) is undefined
				plugin = new $.onepage_scroll @, options
				$(@).data 'onepage_scroll', plugin
			# else return plugin
			else
				$(@).data 'onepage_scroll'