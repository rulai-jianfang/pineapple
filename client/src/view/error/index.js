import React from 'react';
import {
  Tabs, Table, Modal,
 } from 'antd';
 import { echartLine, echartPie } from '../../component/Chart/index';
 import Filter from '../../component/Filter/filter';
 import data from '../../common/data';
 import localUtils from '../../common/utils';
 import { PAGINATION_NUM } from '../../common/constants';


class Error extends React.Component {
  static submit1(filter) {
    data.queryError(filter).then((json) => {
      echartLine({ id: 'chart', data: json.data, unit: '个' });
    });
  }

  static submit3(filter) {
    data.queryErrorBrowser(filter).then((json) => {
      echartPie({
        id: 'pie',
        data: json.data,
        click: (param) => {
          data.queryErrorBrowserVersion({ ...filter, name: param.data.name }).then((version) => {
            // console.log(versions);
            Modal.info({
              title: '浏览器版本',
              content: version.data.map((item) => <p key={item}>{item}</p>),
            });
          });
        },
      });
    });
  }

  constructor(props) {
    super(props);
    this.state = {
      list: [],
      count: 0,
      pageNumber: PAGINATION_NUM,
    };
    this.submit2 = this.submit2.bind(this);

    this.columns = [
      {
        title: '错误描述',
        dataIndex: 'desc',
        key: 'desc',
        width: '20%',
      },
      {
        title: '错误栈',
        dataIndex: 'stack',
        key: 'stack',
        width: '20%',
      },
      {
        title: '错误地址',
        dataIndex: 'url',
        key: 'url',
        width: '20%',
      },
      {
        title: '代理',
        dataIndex: 'agent',
        key: 'agent',
      },
      {
        title: '创建日期',
        dataIndex: 'created',
        key: 'created',
      },
    ];
  }

  submit2(filter) {
    this.filter = filter; // 内部缓存
    this.query(1);
  }

  query(page) {
    const { pageNumber } = this.state;
    const offset = localUtils.getPaginationOffset(page, pageNumber);
    data.queryErrorList({ ...this.filter, offset, number: pageNumber }).then((json) => {
      const { list, count } = json.data;
      this.setState({
        list,
        count,
      });
    });
  }

  render() {
    const { TabPane } = Tabs;
    const { list, count, pageNumber } = this.state;
    const pagination = {
      showQuickJumper: true,
      total: count,
      defaultPageSize: pageNumber,
      onChange: (page) => {
        this.query(page);
        document.documentElement.scrollTop = 0;
      },
    };

    return (
      <div className="card-container">
        <Tabs type="card">
          <TabPane tab="折线图" key="1">
            <Filter submit={Error.submit1} isShowTime isError />
            <div id="chart" className="echart-line" />
          </TabPane>
          <TabPane tab="列表" key="2">
            <Filter submit={this.submit2} isShowTime={false} isError />
            <Table dataSource={list} columns={this.columns} pagination={pagination} />
          </TabPane>
          <TabPane tab="饼图" key="3">
            <Filter submit={Error.submit3} isShowTime={false} isError />
            <div id="pie" className="echart-pie" />
          </TabPane>
        </Tabs>
      </div>
    );
  }
}

export default Error;
