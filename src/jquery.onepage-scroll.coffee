###
Name    : jQuery Onepage Scroll
Author  : Niklas Postulart, @niklaspostulart
Version : 1.1.4
Repo    : https://github.com/npostulart/onepage-scroll
Website : http://niklaspostulart.de
###


"use strict"

# Wrapper function that allows us to pass it to define later
wrap = ( $ ) ->

	# Check if value is int
	isInt = ( n ) -> n isnt "" and not isNaN(n) and Math.round(n) is n

	# Partial class remove plugin
	# partialMath = the class partial to match against, like "btn-" to match "btn-danger btn-active" but not "btn"
	# endOrBegin = omit for beginning match; provide a 'truthy' value to only find classes ending with match
	$.fn.stripClass = ( partialMatch, endOrBegin ) ->
		x = new RegExp (if not endOrBegin then "\\b" else "\\S+" ) + partialMatch + "\\S*", "g"
		@.attr "class", ( i, c ) ->
			return if not c
			c.replace x, ""
		@

	$.onepage_scroll = ( element, options ) ->
		# plugin settings
		@settings = {}

		# jQuery version of DOM element attached to the plugin
		@$element = $ element

		# Current Plugin state
		@state = ""
		@eventState = ""

		# Waittime for next scroll/swipe-Event
		@quietPeriod = 500

		# Returns true if browser supports transitions
		supportTransition = () ->
			thisBody = document.body or document.documentElement
			thisStyle = thisBody.style
			thisStyle.transitions isnt undefined or thisStyle.WebkitTransition isnt undefined

		# Returns ture if browser supports transform (2D)
		supportTransform = () ->
			prefixes = "Webkit Moz O ms".split " "
			prop = "transform"
			thisBody = document.body or document.documentElement
			thisStyle = thisBody.style

			support = thisStyle[prop] isnt undefined

			if not support
				prop = prop.charAt(0).toUpperCase() + prop.slice(1)
				for prefix in prefixes
					return true if thisStyle[prefix+prop] isnt undefined

			support

		# Scroll Animation
		# afterMove function is called after animation
		@transformPage = ( index, callback ) ->
			callback = if typeof callback isnt "function" then $.noop else callback
			pos = ( ( index - 1 ) * 100 ) * -1
			# If Browser doesn't support transitions use jQuery animate
			if not @supportTransition or not @supportTransform
				@$element.animate
					top: "#{pos}%"
				, () =>
					@settings.afterMove index
					callback index
			# Use transform and transition for animation
			else
				@$element.css
					"-ms-transform": "translate(0, #{pos}%)"
					"-ms-transition": "all #{@settings.animationTime}ms #{@settings.easing}"
					"-webkit-transform": "translate(0, #{pos}%)"
					"-webkit-transition": "all #{@settings.animationTime}ms #{@settings.easing}"
					"transform": "translate(0, #{pos}%)"
					"transition": "all #{@settings.animationTime}ms #{@settings.easing}"
				@$element.one "webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend", () =>
					@settings.afterMove index
					callback index
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
			current_index = current.data("index")

			if not isInt page_index
				target = @$element.find(page_index)
				return if target.length isnt 1
				page_index = target.data("index")
				return if not isInt page_index

			return if page_index is current_index
			index = page_index
			if @settings.smooth and Math.abs(current_index - page_index) > 1
				index = if page_index > current_index then current_index + 1 else current_index - 1

			# Check if page_index is outside the slides
			if index < 1 or index > @total
				# if loop is enabled set the index to the according position
				if @settings.loop
					index = if index < 1 then @total else 1
				else
					return

			# Get next element
			next = $("#{@settings.sectionContainer}[data-index='#{index}']")

			# Call beforeMove callback function
			@settings.beforeMove current.data("index")
			# Set classes of current and next element
			current.removeClass "active"
			next.addClass "active"
			# if pagination is enabled set the correct classes
			if @settings.pagination
				$(".onepage-pagination li a.active").removeClass "active"
				$(".onepage-pagination li a[data-index='#{index}']").addClass "active"
			# Set the body class to the currently viewed slide
			$("body").removeClass("viewing-page-#{current.data("index")}").addClass("viewing-page-#{next.data("index")}")

			# Update the Browser URL if enabled
			@updateHistory index if @settings.updateURL

			# Call the animation function
			if @settings.smooth and page_index isnt index
				@transformPage index, =>
					@moveTo page_index
			else
				@transformPage index
			@

		# Update the history according to the given index
		@updateHistory = ( index ) ->
			# Check if function exists
			if history.replaceState
				href = window.location.href.substr 0, "#{window.location.href.indexOf("#")}##{(index)}"
				history.pushState {}, document.title, href
			@

		# Bind all events
		@bindEvents = ->
			# Only bind if events not already binded
			return if @eventState is "binded" or @state isnt "created"
			@bindScrollEvents()
			@bindSwipeEvents()
			@bindKeyEvents() if @settings.keyboard
			@eventState = "binded"
			@

		# Unbind all events
		@unbindEvents = ->
			# Only unbind if events already binded
			return if @eventState isnt "binded" or @state isnt "created"
			@unbindScrollEvents()
			@unbindSwipeEvents()
			@unbindKeyEvents() if @settings.keyboard
			@eventState = "unbinded"
			@

		# Bind scroll Events
		@bindScrollEvents = ->
			$(document).bind "mousewheel.onepage DOMMouseScroll.onepage", ( e ) =>
				e.preventDefault()
				delta = e.originalEvent.wheelDelta || -e.originalEvent.detail
				@init_scroll e, delta
			@

		# Unbind scroll Events
		@unbindScrollEvents = ->
			$(document).unbind "mousewheel.onepage DOMMouseScroll.onepage"
			@

		# Bind swipeDown and swipeUp Events
		@bindSwipeEvents = ->
			hammer = @$element.hammer()
			# Bind swipedown gesture
			@$element.hammer().on "swipedown.onepage", ( e ) =>
				e.preventDefault()
				# prevent default gesture event
				e.gesture.preventDefault()
				@moveUp()
			# Bind swipeup gesture
			.on "swipeup.onepage", ( e ) =>
				e.preventDefault()
				# prevent default gesture event
				e.gesture.preventDefault()
				@moveDown()
			@

		# Unbind swipeDown and swipeUp Events
		@unbindSwipeEvents = ->
			hammer = @$element.hammer()
			hammer.off "swipedown.onepage"
			hammer.off "swipeup.onepage"
			@

		# Bind key Events
		@bindKeyEvents = ->
			$(document).on "keydown.onepage", ( e ) =>
				tag = e.target.nodeName
				return if tag is "INPUT" or tag is "TEXTAREA"
				switch e.which
					when 33, 38 then @moveUp() # page up, arrow up
					when 34, 40 then @moveDown() # page down, arrow down
					when 36 then @moveTo 1 # home
					when 35 then @moveTo @total # end
					else return
				e.preventDefault()
			@

		# Unbind key Events
		@unbindKeyEvents = ->
			$(document).off "keydown.onepage"
			@

		# Return if viewport is too small
		@viewportTooSmall = ->
			return true if @settings.responsiveFallbackWidth isnt false and $(window).width() < @settings.responsiveFallbackWidth
			return true if @settings.responsiveFallbackHeight isnt false and $(window).height() < @settings.responsiveFallbackHeight
			return false

		# Responsive behaviour
		@watchResponsive = ->
			# if window smaller than fallback size in settings
			if @viewportTooSmall()
				# Destroy Plugin
				@destroy() if @state is "created"
			else
				# Create Plugin
				@create() if @state isnt "created"
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
		@bindPagination = ->
			$(".onepage-pagination").on "click.onepage", "li a", (e) =>
				# get index value from link
				page_index = $(e.currentTarget).data "index"
				@moveTo page_index
			@

		# Set class and css for the sections and create pagination elements
		@createSections = ->
			# Set css for each section
			topPos = 0
			$.each @sections, ( i, elem ) =>
				$(elem).addClass("section").attr("data-index", i+1).css
					position: "absolute"
					top: "#{topPos}%"
				topPos += 100
				# Add element to paginationlist
				@paginationList += "<li><a data-index='#{i+1}' href='##{i+1}'></a></li>" if @settings.pagination
			@

		# Remove class and css for the sections
		@destroySections = ->
			# Remove css and class for each section
			@sections.removeClass("section active").removeAttr("data-index style")
			@

		# Destroy all plugin bindings and modifications on DOM
		@destroy = ->
			# Check if Plugin is created
			if @state is "created"
				# Call before destroy callback
				@settings.beforeDestroy()
				# Remove classes and style attributes
				$("html, body").removeClass "onepage-scroll-enabled"
				$("body").stripClass "viewing-page-"
				@$element.removeClass("onepage-wrapper").removeAttr("style")
				# Destroy section bindings
				@destroySections()
				# Remove pagination handling and elements
				if @settings.pagination
					# unbind events before remove
					$("ul.onepage-pagination").off "click.onepage", "li a"
					$("ul.onepage-pagination").remove()
				# Remove event bindings
				@unbindEvents()
				# Set state
				@state = "destroyed"
				# Call after destroy callback
				@settings.afterDestroy()
			@

		# Create all plugin bindings and modifications on DOM
		@create = ->
			if @state isnt "created"
				# Do nothing if viewport is too small
				return if @viewportTooSmall()
				# Call before create callback
				@settings.beforeCreate()
				# All sections
				@sections = $ @settings.sectionContainer
				# Section count
				@total = @sections.length
				# Time of last animation
				@lastAnimation = 0
				# List of pagination elements
				@paginationList = ""
				# Add styling to html and body
				$("html, body").addClass "onepage-scroll-enabled"
				# Prepare everything before binding wheel scroll
				@$element.addClass("onepage-wrapper").css "position", "relative"
				# Create section styling and binding
				@createSections()
				# Create pagination
				if @settings.pagination
					$("<ul class='onepage-pagination'>#{@paginationList}</ul>").prependTo "body"
					posTop = ($(".onepage-pagination").height() / 2) * -1
					$(".onepage-pagination").css "margin-top", posTop
					# Bind pagination events
					@bindPagination()
				# Resets the view to first slide
				@reset()
				# Check for url hash
				if @settings.updateURL and window.location.hash isnt "" and window.location.hash isnt "#1"
					init_index = window.location.hash.replace "#", ""
					@moveTo init_index
				# Add event bindings
				@bindEvents()
				# Set state
				@state = "created"
				# Call after create callback
				@settings.afterCreate()
			@

		# Reset to first slide view
		@reset = ->
			# Set first slide active
			$("#{@settings.sectionContainer}[data-index='1']").addClass "active"
			$("body").addClass "viewing-page-1"
			$(".onepage-pagination li a[data-index='1']").addClass "active" if @settings.pagination
			$(window).scrollTop 0

		# Initialize plugin method
		@init = ->
			# Concatenate settings and options
			@settings = $.extend( {}, @defaults, options )

			@supportTransition = supportTransition()
			@supportTransform = supportTransform()

			# Enable responsive Fallback if set
			if @settings.responsiveFallbackWidth isnt false or @settings.responsiveFallbackHeight isnt false
				$(window).on "resize.onepage", () =>
					@watchResponsive()

			# Create everything
			@create()

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
		responsiveFallbackWidth: false # You can fallback to normal page scroll by defining the width of the browser in which you want the responsive fallback to be triggered. For example, set this to 600 and whenever the browser's width is less than 600, the fallback will kick in.
		responsiveFallbackHeight: false # You can fallback to normal page scroll by defining the height of the browser in which you want the responsive fallback to be triggered. For example, set this to 600 and whenever the browser's height is less than 600, the fallback will kick in.
		smooth: false # You can set if a direct move to a slide should iterate over the other slides or not (direct jump)
		beforeCreate: $.noop # This option accept a callback function. The function will be called before the onepagescroll is created.
		afterCreate: $.noop # This option accept a callback function. The function will be called after the onepagescroll is created.
		beforeDestroy: $.noop # This option accept a callback function. The function will be called before the onepagescroll is destroyed.
		afterDestroy: $.noop # This option accept a callback function. The function will be called after the onepagescroll is destroyed.

	$.fn.onepage_scroll = ( options ) ->
		# for each element
		@.each ->
			# bind plugin only if not set
			if $(@).data( "onepage_scroll" ) is undefined
				plugin = new $.onepage_scroll @, options
				$(@).data "onepage_scroll", plugin
		# If only one element and data element is set return plugin
		if @.length is 1 and $(@).data( "onepage_scroll" ) isnt undefined
			$(@).data "onepage_scroll"

	$.fn.onepage_scroll

# Check for the presence of an AMD loader and if so pass the wrap function to define
# We can safely assume 'jquery' is the module name as it is a named module already - http://goo.gl/PWyOV
if typeof define is "function" and define.amd
	define ["jquery"], wrap
else
	wrap jQuery