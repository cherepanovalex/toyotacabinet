/*
	форма Авторизации
	------------------------------------------------------
	использованные библиотеки:
	- https://getbootstrap.com/docs/3.3/javascript/#modals
	- http://robinherbots.github.io/Inputmask/
	------------------------------------------------------ */
var RECOVER_G_CAPTHA = 0;
var full_registration_captcha_id = null;
var fast_registration_captcha_id = null;
var registration_complite = 0;
var registration_complite_type = '';
var submit_counter_sms = 0;
var submit_counter_full = 0;

var onloadCallback = function () {
	$('#g_recaptcha1').html('');
	$('#g_recaptcha2').html('');
	if($('#g_recaptcha2').length) {
		fast_registration_captcha_id = grecaptcha.render('g_recaptcha2', {
			'sitekey': '6LcuLwwUAAAAAPy76AQIdnCDJf-2dhN3b09skGa6',
			'callback': recoverVerifyCallback
		});
	}
	if($('#g_recaptcha1').length) {
		fast_registration_captcha_id = grecaptcha.render('g_recaptcha1', {
			'sitekey': '6LcuLwwUAAAAAPy76AQIdnCDJf-2dhN3b09skGa6',
			'callback': recoverVerifyCallback
		});
	}
};
var recoverVerifyCallback = function (response) {
	$.post('/ajax_index.php', {page: 'mobile_registration', action: 'send_q_g_captha', response: response}, function (result) {
		if (parseInt(result['status']) === 1) {
			RECOVER_G_CAPTHA = 1;
		} else {
			RECOVER_G_CAPTHA = 0;
		}
		$(document).trigger("captchaEvent");
	}, 'json');
};
(function() {
setInterval(function () {
	$.get(
		"/promo/hunting_for_toyota/data_api.php",
		{},
		function (data) {
			try {
				data =JSON.parse(data);
				$('.link-balance span').html(data.total);
			}
			catch(e) {
				console.log('page content EROR: ' + data);
			}

		}
	);

},5000);
	var $form 	= $("[data-role=\"form-login\"]").find("form");
	var $modal 	= $("#modal--login");

	//маски
	$form.find("[data-inputmask]").inputmask({
		showMaskOnHover: true
	});



	//сброс формы
	// var reset = function() {
	// };


	//события модального окна
	// $modal
		//модалка открывается
		// .on("show.bs.modal", function() {
		// })
		//модалка полностью открылась
		// .on("shown.bs.modal", function() {
		// })
		//модалка закрывается
		// .on("hide.bs.modal", function() {
		// })
		//модалка полностью закрылась
		// .on("hidden.bs.modal", function() {
		// 	reset();
		// });

})();
//------------------------------------------------------



/*
	форма Регистрации
	------------------------------------------------------
	использованные библиотеки:
	- https://getbootstrap.com/docs/3.3/javascript/#modals
	- http://keith-wood.name/countdown.html
	------------------------------------------------------ */

var _modalBlock = (function () {

	var $form 			= $("[data-role=\"form-reg\"]").find("form");
	var $modal			= $("#modal--reg");
	var $timerText  = $("[data-role=\"timer-text\"]");
	var $timerShort = $("[data-role=\"timer-short\"]");
	var lang 				= $timerText.data("lang");
	var timerText, timerShort;

	if (lang=="ru") $.countdown.setDefaults($.countdown.regionalOptions.ru);
	if (lang=="kz") $.countdown.setDefaults($.countdown.regionalOptions.kz);
	//маски
	$form.find("[data-inputmask]").inputmask({
		showMaskOnHover: true
	});

	//сброс формы
	var reset = function() {
		$("[data-button=\"sendSms\"]").removeClass("disabled");
		$form
			.find("[type=\"tel\"]").val("").end()
			.find("[name=\"old_cap\"]").val("").end()
			.find("[data-role=\"sms\"]").removeClass("disabled").end()
			.find("[data-role=\"step2\"]").hide().end()
			.find("[data-role=\"step1\"]").show();
		if (timerText) {
			timerText.countdown("pause");
			$timerText.empty();
		}
		if (timerShort) {
			timerShort.countdown("pause");
			$timerShort.empty();
		}
	};

	var timer_start = function() {
		$("[data-button=\"sendSms\"]").addClass("disabled");
		$form
			.find("[data-role=\"sms\"]").addClass("disabled").end()
			.find("[data-role=\"tipSmsError\"]").hide().end()
			.find("[data-role=\"tipSms\"]").show().end()
			.find("[data-role=\"step1\"]").hide().end()
			.find("[data-role=\"step2\"]").show();
		if (timerText) {
			timerText.countdown("pause");
			$timerText.empty();
		}
		if (timerShort) {
			timerShort.countdown("pause");
			$timerShort.empty();
		}
		$timerText.html("<span />");
		timerText = $timerText.children("span").countdown({
			until: +150,
			format: "ms",
			layout: "<span class=\"mins\">{mn} {ml}</span> <span class=\"secs\">{sn} {sl}</span>",
			onTick: function(periods) {
				var mins = periods[5];
				if (mins==0) $timerText.addClass("show-secs");
			},
			onExpiry: function() {
				$("[data-button=\"sendSms\"]").removeClass("disabled");
				$form
					.find("[data-role=\"tipSms\"]").hide().end()
					.find("[data-role=\"tipSmsError\"]").show();
			}
		}, $.countdown.regionalOptions[lang]);
		$timerShort.html("<span />");
		timerShort = $timerShort.children("span").countdown({
			until: +150,
			timeSeparator: ":",
			compact: true,
			format: "ms"
		});
	};

	//переключения типа каптчи
	var switchCaptcha = function() {
		$form
			.find("[data-role=\"captcha-default\"]").toggle().end()
			.find("[data-role=\"captcha-alt\"]").toggle();
		checkEnable();
	};

	$form
		.find("[data-role=\"captcha-switch\"]").on("click", function(e) {
			e.preventDefault();
			$(this).blur();
			switchCaptcha();
		}).end()
		.find("[data-button=\"sendSms\"]").on("click", function (e) {
			timer_start();
			resend_sms();
		e.preventDefault();
	});

	//события модального окна
	$modal
		//модалка открывается
		.on("show.bs.modal", function() {
			checkEnable();
		})
		//модалка полностью открылась
		// .on("shown.bs.modal", function() {
		// })
		//модалка закрывается
		// .on("hide.bs.modal", function() {
		// })
		//модалка полностью закрылась
		.on("hidden.bs.modal", function() {
			reset();
		});

	var checkEnable = function() {
		var enable = $form.find("#confirm").is(":checked");
		var phone = $form.find("[type=\"tel\"]").val();

		if (!phone || phone=="") enable = false;

		if ($form.find("[data-role=\"captcha-default\"]").is(":visible")) {
			if (RECOVER_G_CAPTHA===0) enable = false;
		} else {
			if (!$form.find("[name=\"old_cap\"]").val()) enable = false;
		}

		$form.find("[data-role=\"step1\"]").find(".btn--submit").attr("disabled", !enable);
	};

	checkEnable();

	$form.find("[type=\"tel\"], [name=\"old_cap\"]").on("keyup", function() {
		checkEnable();
	});

	$(document).bind("captchaEvent", function() {
		checkEnable();
	});

	$form.find("#confirm").on("change", function() {
		checkEnable();
	});

	return {
		timer_start : function(){
			timer_start();
		}
	};

})();

var captcha_ok = 0;
var validation_ok = 0;
var reloadCaptcha = function () {
	var microTime = (Date.now() % 1000) / 1000;
	captcha_ok= 0;
	RECOVER_G_CAPTHA = 0;
	grecaptcha.reset(fast_registration_captcha_id);
	var microTime = (Date.now() % 1000) / 1000;
	document.querySelectorAll('.group-alt img').forEach(function(old_captcha) {
		old_captcha.setAttribute('src','/code_img.php?'+microTime);
	});
};
var submitForm = function () {
	//document.querySelector(document.querySelector('#registration_form > fieldset[data-role="sms"] input[name="login"]').value)
	submitButton  = document.querySelector('#registration_form > fieldset[data-role="step1"] button[data-button="regAction"]');
	submitButton.addEventListener('click',function (event) {
		submit_counter_sms = submit_counter_sms + 1;
		event.preventDefault();
		if(document.querySelector('#registration_form > fieldset[data-role="step1"] .group-default').style.display =='none'){
			ajaxMethod({
				page: 'mobile_registration',
				action: 'check_captcha_method2',
				input: document.querySelector('#registration_form > fieldset[data-role="step1"] input[name="old_cap"]').value
			}, textCaptchaSuccess, false);
		}else{
			if (RECOVER_G_CAPTHA === 1) {
				captcha_ok = 1;
			} else {
				captcha_ok = 0;
			}
		}

		validation_ok = document.querySelectorAll('#registration_form > fieldset[data-role="sms"] input[type="checkbox"]:checked').length;
		if (captcha_ok === 1 && validation_ok > 0 ) {
			var phone_input = document.querySelector('#registration_form > fieldset[data-role="sms"] input[name="login"]').value.replace(/^\D+/g, '').replace(/\s+/g, '');
			ajaxMethod({
				action   : 'sms_registration',
				page     : 'mobile_registration',
				number   : phone_input,
				currency : 1
			}, submitFormSuccess, true);
		}else{
			reloadCaptcha();
		}
	});
};
const recover_form 	= $("[data-role=\"form-pass\"]").find("form");
var recoverPass = function () {

	document.querySelector('#form-recovery > fieldset[data-step="passStep1"] button[data-button="showStep2"]').addEventListener('click', function (event) {
		event.preventDefault();
		if (document.querySelector('#form-recovery > fieldset[data-step="passStep1"] .group-default').style.display == 'none') {
			var cap_old = document.querySelector('#form-recovery > fieldset[data-step="passStep1"] input[name="old_cap"]').value.replace(/^\D+/g, '').replace(/\s+/g, '');
			ajaxMethod({
				page   : 'mobile_registration',
				action : 'check_captcha_method2',
				input  : cap_old,
			}, textCaptchaSuccess, false);
		} else {
			if (RECOVER_G_CAPTHA === 1) {
				captcha_ok = 1;
			} else {
				captcha_ok = 0;
			}
		}
		if (captcha_ok === 1) {
			var phone_input = document.querySelector('#form-recovery > fieldset[data-step="passStep1"] input[name="login"]').value.replace(/^\D+/g, '').replace(/\s+/g, '');
			ajaxMethod({
				page   : 'recover',
				action : 'submit_recovery_step1',
				phone  : phone_input,
			}, sendRecoverSmsSuccess, true);
		} else {
			reloadCaptcha();
		}
	});
}
var recoverCheckSms = function () {
	document.querySelector('#form-recovery > fieldset[data-step="passStep2"] button[data-button="showStep3"]').addEventListener('click', function (event) {
		event.preventDefault();
		var code = document.querySelector('#form-recovery > fieldset[data-step="passStep2"] input').value.replace(/^\D+/g, '').replace(/\s+/g, '');
		ajaxMethod({
			page   : 'recover',
			action : 'recover_check_sms_code',
			sms_code  : code,
		}, checkRecoverCodeSuccess, true);

	});
}

var setNewPass = function () {
	document.querySelector('#form-recovery > fieldset[data-step="passStep3"] button[type="submit"]').addEventListener('click', function (event) {
		event.preventDefault();
		var pass_inputs = document.querySelectorAll('#form-recovery > fieldset[data-step="passStep3"] input');
		var new_pass = pass_inputs[0];
		var new_pass_repeat = pass_inputs[1];
		ajaxMethod({
			page    : 'recover',
			action  : 'recover_change_pass',
			pass    : new_pass.value,
			pass_re : new_pass_repeat.value,
		}, setNewPassSucces, true);

	});
}

var ajaxMethod = function (data, successMethod, async) {
	var _successMethod = successMethod;
	$.ajax({
		url: '/ajax_index.php',
		method: 'POST',
		dataType: 'json',
		data: data,
		async: async,
		beforeSend: function () {

		},
		success: function (response) {
			if(response.status === 0) {
				if (response.code === 400) {
					document.querySelector('#registration_form > fieldset[data-role="sms"] .form-error').innerHTML='Ваш номер уже зарегистрирован';
				}
				this.error(this.xhr, response.msg);
			} else {
				_successMethod(response);
			}
		},
		error: function (xhr, error) {
			document.querySelector('#registration_form > fieldset[data-role="sms"] .form-error').innerHTML=error;
			document.querySelector('#registration_form > fieldset[data-role="sms"] .form-error').style.display='block';
			reloadCaptcha();
		}
	});
};


var submitFormSuccess = function (response) {
	if(response.status === 1) {
		validation_ok = 0;
		captcha_ok = 0;
		document.querySelector('#registration_form > fieldset[data-role="sms"] .form-error').style.display='none';
		document.querySelector('#registration_form > fieldset[data-role="step2"] input[type="tel"]').value = document.querySelector('#registration_form > fieldset[data-role="sms"] input[name="login"]').value.replace(/^\D+/g, '').replace(/\s+/g, '').slice(1)
		_modalBlock.timer_start();
	}
	else
	{
		document.querySelector('#registration_form > fieldset[data-role="sms"] .form-error').innerHTML=error_text;
		document.querySelector('#registration_form > fieldset[data-role="sms"] .form-error').style.display='block';
		console.log('Fast / Error' + submit_counter_sms);
	}

};

var submitFormResend= function (response) {
	if(response.status === 1) {
		document.querySelector('#registration_form > fieldset[data-role="sms"] .form-error').style.display='none';
		document.querySelector('#registration_form > fieldset[data-role="step2"] input[type="tel"]').value = document.querySelector('#registration_form > fieldset[data-role="sms"] input[name="login"]').value.replace(/^\D+/g, '').replace(/\s+/g, '').slice(1)
	}
	else
	{
		document.querySelector('#registration_form > fieldset[data-role="sms"] .form-error').innerHTML=error_text;
		document.querySelector('#registration_form > fieldset[data-role="sms"] .form-error').style.display='block';
		console.log('Fast / Error' + submit_counter_sms);
	}

};

var resend_sms = function () {
	phone_input = document.querySelector('#registration_form > fieldset[data-role="sms"] input[name="login"]').value.replace(/^\D+/g, '').replace(/\s+/g, '');
	ajaxMethod({
		page: 'mobile_registration',
		action: 'resend_sms',
		number: phone_input
	}, submitFormResend, false);

};
var textCaptchaSuccess = function (response) {
	captcha_ok = parseInt(response['status']);
	$(document).trigger("captchaEvent");
};
var sendRecoverSmsSuccess = function (response) {
		reloadCaptcha();
		if(response.recover_by_tel_number === 1){
			recover_form
				.find("[data-step=\"passStep1\"]").hide().end()
				.find("[data-step=\"passStep2\"]").show();
		}
		if(response.email_err === 1){
			recover_form.find('.form-error').html(response.email_err_text);
			recover_form.find("[data-step=\"passStep1\"] .form-error").show();
		}
		if(response.tel_number_err === 1){
		recover_form.find('.form-error').html(response.tel_number_err_text);
		recover_form.find("[data-step=\"passStep1\"] .form-error").show();
		}

};
var checkRecoverCodeSuccess = function (response) {
	if(response.status === 1){
		recover_form
			.find("[data-step=\"passStep2\"]").hide().end()
			.find("[data-step=\"passStep3\"]").show();
	}else{
		recover_form.find('.form-error').html(response.err_text)
		recover_form.find("[data-step=\"passStep2\"] .form-error").show();
	}

};
var setNewPassSucces = function (response) {
	if (response.status === 1) {
		$("[data-role=\"form-login\"]").show();
		$("[data-role=\"form-pass\"]").hide();
	} else {
		recover_form.find('.form-error').html(response.tel_number_err_text);
		recover_form.find("[data-step=\"passStep3\"] .form-error").show();
	}
};
(function () {
	submitForm();
	recoverPass();
	recoverCheckSms();
	setNewPass();
}
)();

//------------------------------------------------------



/*
	секция Кабинет
	--------------------------------------
	использованные библиотеки:
	- https://developer.snapappointments.com/bootstrap-select/
	- https://getbootstrap.com/docs/3.3/javascript/#tabs
	- https://listjs.com/
 	-------------------------------------- */
(function() {
	var $tickets = $("[data-role=\"tickets\"]");

	if (!$tickets["length"]) return false;

	var $phone 	= $("[data-device=\"phone\"]");
	var isPhone = !$phone.is(":visible");

	$(".tickets-tab").each(function() {
		var options = {
		  valueNames: ["number"],
		  page: 20,
	      pagination: {
		    innerWindow: 2,
		    outerWindow: 1
	      }
		};

		var $tab = $(this);
		var userList = new List($tab[0], options);
		var $select = $tab.find("select").selectpicker();
		var limit 	= $select.val();

		var updateLimit = function(value) {
			userList["page"] = value;
			userList.update();
		};

		var resize = function() {
			if ($phone.is(":visible") && !isPhone) {
				isPhone = true;
				updateLimit(28);
			}
			if (!$phone.is(":visible") && isPhone) {
				isPhone = false;
				updateLimit($select.val());
			}
		};

		resize();

		$(window).on("resize", function() {
			resize();
		});

		$select.on("change", function() {
			limit = $select.val();
			updateLimit(limit);
		});

		$tab.find('input[type="search"]').on('keyup', function () {
			if (this.value.length > 9) {
				this.value = this.value.slice(0, -1);
				return false;
			}
			if (this.value.length == 9) {
				if ($tab.find('.number').filter(":contains('" + this.value + "')").length <= 0) {
					$.get("/promo/hunting_for_toyota/data_api.php?get_ticket=true&ticket_num=" + this.value, function (data, status) {
						data = JSON.parse(data);
						if (data.totalCoupons > 0) {
							for (let i in data.coupons) {
								let ticket_block = document.createElement('div');
								ticket_block.setAttribute('class', 'ticket');
								let t1 = document.createElement('div');
								t1.setAttribute('class', 'inner');
								let t2 = document.createElement('div');
								t2.setAttribute('class', 'date');
								t2.textContent = data.coupons[i].issuedAt;
								let t3 = document.createElement('div');
								t3.setAttribute('class', 'number');
								t3.textContent = data.coupons[i].number;
								ticket_block.appendChild(t1);
								t1.appendChild(t2);
								t1.appendChild(t3);
								$tab.find('.block-in.list').append(ticket_block);
								var options = {
									valueNames: ["number"],
									page: 20,
									pagination: {
										innerWindow: 2,
										outerWindow: 1
									}
								};
								limit = $select.val();
								updateLimit(limit);
							}
						}
					});
				}
			}
		});

	});

	$("[data-role=\"tab-switcher\"]").on("click", function(e) {
		e.preventDefault();
		var tab = $(this).data("tab");
		$(this).parent().addClass("active").siblings().removeClass("active");
		$(".tickets-tab").hide();
		$("#tickets-tab-" + tab).show();
	});

})();
//--------------------------------------

document.querySelector('#authWindowForm').addEventListener('submit', function(e) {
	e.preventDefault();
	xlogin(this);
});

document.querySelector('#registration_form').addEventListener('submit', function(e) {
	e.preventDefault();
	xlogin(this);
});
function xlogin(form) {
	var xhr = new XMLHttpRequest();
	var body ="login=" + encodeURIComponent(form.querySelector('input[name="login"]').value.replace(/[^\d]/g,"")) +
		"&passw=" + encodeURIComponent(form.querySelector('input[name="passw"]').value)+
		"&asid=" + encodeURIComponent(form.querySelector('input[name="asid"]').value)+
		"&psid=" + encodeURIComponent(form.querySelector('input[name="psid"]').value);
	xhr.open("POST","/index.php", true);
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
	xhr.onreadystatechange = function() {
		if (this.readyState != 4) return;
		if(JSON.parse(xhr.responseText).success){
			window.location.href="/promo/hunting_for_toyota/"+tpl_lang+"/cabinet.php";
		} else{
			form.querySelector('.form-error').style.display='block';
			form.querySelector('.form-error').innerHTML=JSON.parse(xhr.responseText).msg
		}
	}
	xhr.send(body);
}

function getMyTickes(month='',pageSize=50,page=1,year=2020) {
	var ussid = getCookie('ussid');
	var url = 'http://185.219.221.216:8080/api/user/myCoupons?session='+ussid+'&page='+page+'&pageSize='+pageSize+'&year='+year+'&month=SEPTEMBER';
	var oReq = new XMLHttpRequest();
	oReq.onload = function () {
		console.log(this.responseText);
	}
	oReq.open("get", url, true);
	oReq.send();
}
function getOverAllData(){
	var ussid = getCookie('ussid');
	var url = 'http://185.219.221.216:8080/api/user/userData?session='+ussid;
	var oReq = new XMLHttpRequest();
	oReq.onload = function () {
		console.log(this.responseText);
	}
	oReq.open("get", url, true);
	oReq.send();
}
function leader() {
	var ussid = getCookie('ussid');
	var url = 'http://185.219.221.216:8080/api/user/userData?session='+ussid;
	var oReq = new XMLHttpRequest();
	oReq.onload = function () {
		console.log(this.responseText);
	}
	oReq.open("get", url, true);
	oReq.send();
}
function getCookie(cname) {
	var name = cname + "=";
	var decodedCookie = decodeURIComponent(document.cookie);
	var ca = decodedCookie.split(';');
	for(var i = 0; i <ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
}



/*
	форма Восстановления пароля
	------------------------------------------------------
	использованные библиотеки:
	- https://getbootstrap.com/docs/3.3/javascript/#modals
	- http://robinherbots.github.io/Inputmask/
	------------------------------------------------------ */
(function() {
	var first_success = false;
	var second_success = false;
	var $form 	= $("[data-role=\"form-pass\"]").find("form");
	var $modal 	= $("#modal--login");

	//маски
	$form.find("[data-inputmask]").inputmask({
		showMaskOnHover: true
	});
	
	//сброс формы
	var reset = function() {
		$("[data-role=\"form-pass\"]").hide();
		$("[data-role=\"form-login\"]").show();
		$form
			.find("[type=\"tel\"]").val("").end()
			.find("[name=\"old_cap\"]").val("").end()
			.find("[data-step=\"passStep2\"], [data-step=\"passStep3\"]").hide().end()
			.find("[data-step=\"passStep1\"]").show();
	};


	//события модального окна
	$modal
		//модалка открывается
		// .on("show.bs.modal", function() {
		// })
		//модалка полностью открылась
		// .on("shown.bs.modal", function() {
		// })
		//модалка закрывается
		// .on("hide.bs.modal", function() {
		// })
		//модалка полностью закрылась
		.on("hidden.bs.modal", function() {
			reset();
		});

	//переключения типа каптчи
	var switchCaptcha = function() {
		$form
			.find("[data-role=\"captcha-default\"]").toggle().end()
			.find("[data-role=\"captcha-alt\"]").toggle();
		checkEnable();
	};

	$form
		.find("[data-role=\"captcha-switch\"]").on("click", function(e) {
			e.preventDefault();
			$(this).blur();
			switchCaptcha();
		}).end()
		.find("[data-button=\"sendSms\"]").on("click", function() {

		}).end()
		.find("[data-button=\"showStep2\"]").on("click", function() {

		}).end()
		.find("[data-button=\"showStep3\"]").on("click", function() {
			$form
				.find("[data-step=\"passStep2\"]").hide().end()
				.find("[data-step=\"passStep3\"]").show();
		});

	$("[data-button=\"passRecovery\"]").on("click", function(e) {
		e.preventDefault();
		$("[data-role=\"form-login\"]").hide();
		$("[data-role=\"form-pass\"]").show();
		checkEnable();
	});

	$(document).delegate("#reg_rec_pass_link", "click", function(e) {
		e.preventDefault();
		$("#modal--reg").one("hidden.bs.modal", function() {
			setTimeout(function() {
				$("[data-role=\"form-login\"]").hide();
				$("[data-role=\"form-pass\"]").show();
				$("#modal--login").modal("show");
			}, 100);
		});
		$("#modal--reg").modal("hide");
	});

	var checkEnable = function() {
		var enable = true;
		var phone = $form.find("[type=\"tel\"]").val();

		if (!phone || phone=="" || phone.indexOf("_")>0) enable = false;

		if ($form.find("[data-role=\"captcha-default\"]").is(":visible")) {
			if (RECOVER_G_CAPTHA===0) enable = false;
		} else {
			if (!$form.find("[name=\"old_cap\"]").val()) enable = false;
		}

		$form.find("[data-step=\"passStep1\"]").find(".btn--submit").attr("disabled", !enable);
	};

	checkEnable();

	$form.find("[type=\"tel\"], [name=\"old_cap\"]").on("keyup", function() {
		checkEnable();
	});

	$(document).bind("captchaEvent", function() {
		checkEnable();
	});
})();
//------------------------------------------------------


