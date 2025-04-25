import { Table, Tag, Space } from 'antd';
import { ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const columns = [
  {
    title: 'Mã đặt',
    dataIndex: 'id',
    key: 'id',
  },
  {
    title: 'Khách hàng',
    dataIndex: 'customer',
    key: 'customer',
  },
  {
    title: 'Loại phòng',
    dataIndex: 'roomType',
    key: 'roomType',
  },
  {
    title: 'Ngày nhận',
    dataIndex: 'checkIn',
    key: 'checkIn',
  },
  {
    title: 'Trạng thái',
    key: 'status',
    dataIndex: 'status',
    render: (status) => {
      let color, icon;
      switch (status) {
        case 'Đã xác nhận':
          color = 'green';
          icon = <CheckCircleOutlined />;
          break;
        case 'Đang chờ':
          color = 'orange';
          icon = <ClockCircleOutlined />;
          break;
        case 'Đã hủy':
          color = 'red';
          icon = <CloseCircleOutlined />;
          break;
        default:
          color = 'blue';
      }
      return (
        <Tag icon={icon} color={color}>
          {status.toUpperCase()}
        </Tag>
      );
    },
  },
];

const data = [
  {
    key: '1',
    id: 'BK001',
    customer: 'Nguyễn Văn A',
    roomType: 'Deluxe',
    checkIn: '2023-05-15',
    status: 'Đã xác nhận',
  },
  {
    key: '2',
    id: 'BK002',
    customer: 'Trần Thị B',
    roomType: 'Suite',
    checkIn: '2023-05-16',
    status: 'Đang chờ',
  },
  {
    key: '3',
    id: 'BK003',
    customer: 'Lê Văn C',
    roomType: 'Standard',
    checkIn: '2023-05-17',
    status: 'Đã hủy',
  },
  {
    key: '4',
    id: 'BK004',
    customer: 'Phạm Thị D',
    roomType: 'Family',
    checkIn: '2023-05-18',
    status: 'Đã xác nhận',
  },
  {
    key: '5',
    id: 'BK005',
    customer: 'Hoàng Văn E',
    roomType: 'VIP',
    checkIn: '2023-05-19',
    status: 'Đang chờ',
  },
];

export default function RecentBookings() {
  return (
    <Table
      columns={columns}
      dataSource={data}
      pagination={false}
      scroll={{ y: 240 }}
      size="middle"
    />
  );
}