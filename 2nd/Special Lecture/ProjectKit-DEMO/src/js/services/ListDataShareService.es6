/*! ListDataShareService.js © yamoo9.net, 2016 */
'use strict';

let angular = require('angular');

angular
  .module('BipanListApp')
  .factory('Contact', ['$resource', function($resource){
    let url = 'https://codecraftpro.com/api/samples/v1/contact/:id/';
    let params = {'id': '@id'};
    let actions = {
      'update':{
        'method': 'PUT'
      },
      'remove': {
        'method': 'DELETE'
      },
      'create': {
        'method': 'POST'
      }
    };
    return $resource(url, params, actions);
  }])
  .service('ListDataShareService', ['Contact', (Contact)=>{

    // 서비스 객체 초기화 함수(비공개)
    let initServiceSetting = ()=> {
      _service.people   = [];
      _service.page     = 1;
      _service.has_more = true;
    };

    let _service = {
      // 초기 선택된 사람 초기화
      'selected_person' : null,
      // 초기 피플 데이터 리스트
      'people'     : [],
      // 초기 페이지 인덱스
      'page'       : 1,
      'has_more'   : true,
      'is_loading' : false,
      'is_saving'  : false,
      'is_deleting': false,
      'is_creating': false,
      // doSearch Method
      'doSearch': (search)=> {
        _service.search = search;
        initServiceSetting();
        _service.loadContacts();
      },
      // doOrder Method
      'doOrder': (order)=> {
        _service.ordering = order;
        initServiceSetting();
        _service.loadContacts();
      },
      // loadContacts Method
      'loadContacts': ()=> {
        if ( _service.has_more && !_service.is_loading ) {

          _service.is_loading = true;

          // 서버에 전송할 파라미터(매개변수)
          let params = {
            'page'     : _service.page,
            'search'   : _service.search,
            'ordering' : _service.ordering,
          };
          // 서버에 요청(GET)
          Contact.get(params, (data)=>{
            angular.forEach(data.results, (person)=>{
              _service.people.push( new Contact(person) );
            });
            // 더 이상 불러올 다음 데이터가 존재하지 않을 경우
            // _service 객체의 has_more 속성을 false로 변경
            if (!data.next) {
              _service.has_more = false;
            }
            _service.is_loading = false;
          });

        }
      },
      'loadMore': ()=> {
        if ( _service.has_more && !_service.is_loading ) {
          // 다음 페이지를 불러오기 위한 페이지 값 증가
          _service.page += 1;
          // 콘텐츠 로드 처리 실행
          _service.loadContacts(); // page = 2, 3, ...
        }
      },
      'updateContact': (person)=> {
        _service.is_saving = true;
        console.log(person);
        person.$update().then(()=> {
          _service.is_saving = false;
        });
      },
      'removeContact': (person)=> {
        _service.is_deleting = true;
        person.$remove().then(()=> {
          let index = _service.people.indexOf(person);
          // 사용자가 선택한 인덱스의 사람을 목록에서 제거
          _service.people.splice(index, 1);
          _service.selected_person = null;
          _service.is_deleting = false;
        });
      },
      'createContact': (person)=> {
        _service.is_creating = true;
        // Contact.save(person).$promise.then(()=> {
        (new Contact(person)).$create().then(()=> {
          initServiceSetting();
          _service.loadContacts();
          _service.is_creating = false;
        });
      },
    };

    _service.loadContacts(); // 초기 실행 page = 1

    return _service;

  }]);