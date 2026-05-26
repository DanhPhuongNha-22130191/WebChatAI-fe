import React, { useState } from 'react';
import Button from '../../shared/components/Button';
import SearchBar from '../../shared/components/SearchBar';
import Card from '../../shared/components/Card';
import TextInput from '../../shared/components/TextInput';
import RoomCard from '../chat/components/sidebar/RoomCard';
import ChatHeader from '../chat/components/chatbox/ChatHeader.jsx';
import MessageSender from '../chat/components/chatbox/MessageSender.jsx';
import MessageReceiver from '../chat/components/chatbox/MessageReceiver.jsx';
import Composer from '../chat/components/chatbox/Composer.jsx';
import colors from '../../shared/constants/colors';

const TestComponentsPage = () => {
    const [searchValue, setSearchValue] = useState('');
    const [inputValue, setInputValue] = useState('');

    return (
        <div style={{ padding: 40, backgroundColor: 'white', minHeight: '100vh' }}>
            <h1 style={{ color: colors.primaryText }}>Test Components</h1>

            {/* 1. BUTTONS */}
            <div style={{ marginBottom: 40 }}>
                <h3>1. Buttons</h3>
                <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                    <div style={{ width: 200 }}>
                        <p>Normal:</p>
                        <Button onClick={() => alert('Clicked!')}>
                            Đăng nhập
                        </Button>
                    </div>
                    <div style={{ width: 200 }}>
                        <p>Disabled:</p>
                        <Button disabled>
                            Không thể bấm
                        </Button>
                    </div>
                    <div style={{ width: 200 }}>
                        <p>Custom Style:</p>
                        <Button style={{ backgroundColor: '#2196F3' }}>
                            Màu khác
                        </Button>
                    </div>
                </div>
            </div>

            {/* 2. INPUTS */}
            <div style={{ marginBottom: 40 }}>
                <h3>2. Inputs</h3>
                <div style={{ width: 300 }}>
                    <TextInput
                        label="Username"
                        placeholder="Nhập tên..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                    />
                    <TextInput
                        label="Password"
                        type="password"
                        placeholder="Nhập mật khẩu..."
                    />
                    <SearchBar
                        placeholder="Tìm kiếm Lang ăn gì"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                    />
                </div>
            </div>

            {/* 3. CARDS */}
            <div style={{ marginBottom: 40 }}>
                <h3>3. Cards</h3>
                <div style={{ display: 'flex', gap: 20 }}>
                    {/* Generic Card */}
                    <Card style={{ width: 200 }}>
                        <h4>Card thường</h4>
                        <p>Nội dung bên trong card.</p>
                    </Card>

                    {/* Active Card */}
                    <Card active style={{ width: 200 }}>
                        <h4>Card Active</h4>
                        <p>Trạng thái đang chọn.</p>
                    </Card>
                </div>
            </div>

            {/* 4. ROOM CARD (Real usage) */}
            <div style={{ marginBottom: 30 }}>
                <h3>4. Room Card (Thực tế)</h3>
                <div style={{ width: 300 }}>
                    <RoomCard
                        name="Hảo há cảo"
                        lastMessage="Tối nay đi ăn gì..."
                        active={false}
                    />
                    <RoomCard
                        name="Dũng ninja"
                        lastMessage="Oke mai gặp"
                        active={true}
                    />
                </div>
            </div>

            {/* 5. CHAT COMPONENTS */}
            <div style={{ marginBottom: 40 }}>
                <h3>5. Chat Components</h3>
                <div style={{
                    width: 360,
                    border: '1px solid #ccc',
                    borderRadius: 12,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    background: colors.cardBackground, // Đổi màu nền components
                    height: 500
                }}>
                    <ChatHeader name="Hảo há cảo" />

                    <div style={{ flex: 1, padding: 10, display: 'flex', flexDirection: 'column', gap: 5, overflowY: 'auto' }}>
                        <MessageReceiver text="Tối nay ăn gì giờ..." />
                        <MessageSender text="Bên Hoàng Diệu 2 cho vui nha" />
                        <MessageReceiver text="Okeiiii, đi thoi đi thoi" />
                        <MessageReceiver text="Nhớ mang tiền nha" />
                        <MessageSender text="Ok ok" />
                    </div>

                    <Composer />
                </div>
            </div>
        </div>
    );
};

export default TestComponentsPage;
