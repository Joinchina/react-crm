import React, { Component } from 'react';
import { Table, Modal, Button, Row, Col, Radio } from 'antd';
// import Swiper from 'swiper';
// import 'swiper/swiper-bundle.css';
import api from '../../api/api';
import './HealthyTable.scss';
import SwiperCore, { Navigation, Thumbs } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper.scss';
import 'swiper/components/navigation/navigation.scss';
SwiperCore.use([Navigation, Thumbs]);

class HealthyTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tableData: {},
      statusVisible: false,
      currentRow: {},
      loading: false,
      status: '',
      thumbsSwiper: null,
      gallerySwiper: null,
      pageSize: props.limit,
      currentPage: 1,
      status:''
    };
  }
  componentWillMount() {
    this.setState({
      tableData: this.props.tableData,
    });
  }
  componentDidMount() {}
  componentDidUpdate() {}
  componentWillReceiveProps(nextProps) {
    if (
      JSON.stringify(this.props.tableData) !==
      JSON.stringify(nextProps.tableData)
    ) {
      this.setState({
        tableData: nextProps.tableData,
      });
    }
    if(nextProps.currentPage !==this.state.currentPage){
      this.setState({
        currentPage:nextProps.currentPage
      })
    }
  }

  // 审核
  verifyStatus = (row) => () => {
    this.setState(
      {
        currentRow: row,
      },
      () => {
        this.setState({
          statusVisible: true,
        });
        console.log('verifyStatus');
      }
    );
  };
  changeCurrentRowStatus = (event) => {
    this.setState({
      status: event.target.value,
    });
  };
  statusSubmit = async (row) => {
    if (this.state.status === '') {
      Modal.warning({
        content: '请选择审核结果',
      });
      return
    }
    try {
      let result = await api.checkMemberStatus(
        this.state.currentRow.id,
        this.state.status
      );
      this.setState({
        statusVisible: false,
        status:''
      });
      this.props.searchData();
    } catch (e) {
      Modal.error({
        content:'审核失败'
      })
    }
  };
  statusSubmitNext = async () => {
    if (this.state.status === '') {
      Modal.warning({
        content: '请选择审核结果',
      });
      return
    }
    try {
      let result = await api.checkMemberStatus(
        this.state.currentRow.id,
        this.state.status
      );
      if (result) {
        let nextId = result.id;

        if (nextId !== null || nextId !== undefined) {
          let row = this.state.tableData.find((item) => {
            return item.id === nextId;
          });
          this.setState({
            currentRow: row,
            status:''
          });

        } else {
          this.setState({
            statusVisible: false,
            status:''
          });
          Modal.success({
            content: '已经没有待审核数据了',
          });
        }
      }
    } catch (e) {
      Modal.error({
        content: '提交失败',
      });
    }
  };
  modalClose = () => {
    this.state.gallerySwiper.destroy();
    this.setState({
      statusVisible: false,
    });
    this.props.searchData();
  };
  setGallerySwiper = (gallerySwiper) => {
    // console.log('gallerySwiper:', gallerySwiper);
    this.setState({
      gallerySwiper,
    });
  };
  setThumbsSwiper = (thumbsSwiper) => {
    // console.log('thumbsSwiper:', thumbsSwiper);
    this.setState({
      thumbsSwiper,
    });
  };

  tableChange = (pagination) => {
    // this.props.changePageIndex(pagination.currentPage)
    // this.props.changPageSize(pagination.pageSize)
    // 如果改变的是每页显示的条数
    if (pagination.pageSize !== this.state.pageSize) {
      this.setState({
        pageSize: pagination.pageSize,
        currentPage: 1,
      });
    } else {
      this.setState({
        pageSize: pagination.pageSize,
        currentPage: pagination.current,
      });
    }
    this.props.changePage(pagination.current, pagination.pageSize);
  };

  render() {
    const columns = [
      {
        title: '会员姓名',
        dataIndex: 'name',
        width: 150,
        key: 'name',
      },
      {
        title: '身份证号',
        dataIndex: 'idCard',
        width: 150,
        key: 'idCard',
      },
      {
        title: '购药时间',
        dataIndex: 'purchaseDate',
        key: 'purchaseDate',
      },
      {
        title: '上传时间',
        dataIndex: 'uploadDate',
        key: 'uploadDate',
      },
      {
        title: '审核状态',
        dataIndex: 'status',
        key: 'status',
        render: (text, row) => {
          let newText = '';
          switch (text) {
            case 0:
              newText = '未审核';
            case 10:
              newText = '通过';
              break;
            case 20:
              newText = '未通过';
              break;
            default:
              newText = '';
          }
          return newText;
        },
      },
      {
        title: '审核时间',
        dataIndex: 'checkDate',
        key: 'checkDate',
      },
      {
        title: '操作',
        key: 'operation',
        render: (text, row) => {
          if (row.status === 0) {
            // 未审核
            return (
              <span
                style={{ textDecoration: 'underline', cursor: 'pointer' }}
                onClick={this.verifyStatus(row)}
              >
                审核
              </span>
            );
          } else {
            return <span></span>;
          }
        },
      },
    ];
    let swiperSlideList = [];
    if (Array.isArray(this.state.currentRow.pics)) {
      swiperSlideList = this.state.currentRow.pics.map((item, index) => {
        return (
          <SwiperSlide key={index}>
            <img src={item} />
          </SwiperSlide>
        );
      });
    }

    let currentRow = this.state.currentRow;
    // 分页
    let { currentPage, pageSize, tableData } = this.state;
    // 如果返回的tableData比pageSize 大。说明还有下一页，此时total值为，前面条数总和加当前条数
    let total =
      tableData.length > pageSize
        ? pageSize * currentPage + 1
        : pageSize * (currentPage - 1) + tableData.length;

    let diffNum = total - tableData.length;
    for (let i = 0; i < diffNum; i++) {
      tableData.unshift({ id: 'myId' + i });
    }
    return (
      <div className='table-box block'>
        <Table
          columns={columns}
          dataSource={tableData}
          rowKey={(record) => record.id}
          pagination={{
            showSizeChanger: true,
            total: total,
            current: currentPage,
            pageSize: pageSize,
            pageSizeOptions: ['10', '20', '30', '40'],
          }}
          onChange={this.tableChange}
        />
        <Modal
          title='处方/购药记录审核'
          visible={this.state.statusVisible}
          onCancel={this.modalClose}
          className='statusModal'
          maskClosable={false}
          width={1000}
          footer={[
            <Button
              key='submit'
              size='large'
              onClick={this.statusSubmit}
              loading={this.loading}
            >
              提交
            </Button>,
            <Button
              key='submitNext'
              type='primary'
              size='large'
              loading={this.loading}
              onClick={this.statusSubmitNext}
            >
              提交并下一个
            </Button>,
          ]}
        >
          <Swiper
            spaceBetween={50}
            slidesPerView={1}
            thumbs={{ swiper: this.state.thumbsSwiper }}
            onSwiper={this.setGallerySwiper}
            className='gallery-top'
            navigation
          >
            {swiperSlideList}
          </Swiper>
          <Swiper
            spaceBetween={50}
            slidesPerView={4}
            onSwiper={this.setThumbsSwiper}
            className='gallery-thumbs'
          >
            {swiperSlideList}
          </Swiper>

          {/* 会员信息 */}
          <div className='info'>
            <Row>
              <Col span={4}>会员姓名：</Col>
              <Col span={8}>{currentRow.name}</Col>
              <Col span={4}>身份证号</Col>
              <Col span={8}>{currentRow.idCard}</Col>
            </Row>
            <Row>
              <Col span={4}>审核结果</Col>
              <Col span={8}>
                <Radio.Group onChange={this.changeCurrentRowStatus} value={this.state.status}>
                  <Radio value={10}>
                    通过
                  </Radio>
                  <Radio value={20}>不通过</Radio>
                </Radio.Group>
              </Col>
            </Row>
          </div>
        </Modal>
      </div>
    );
  }
}

export default HealthyTable;
