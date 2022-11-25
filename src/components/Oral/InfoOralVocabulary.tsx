import React from 'react'

const InfoOralVocabulary = () => {
    return (
        <div className="content__exem__vocabulary">
            <div className="activity__contents">
                <table className='table__user'>
                    <tbody>
                        <tr>
                            <td className='first__col'>
                                - Nội dung thi :
                            </td>
                            <td>
                                Từ vựng cơ bản
                            </td>
                        </tr>
                        <tr>
                            <td className='first__col'>
                                - Tổng số câu :
                            </td>
                            <td>
                                35
                            </td>
                        </tr>
                        <tr>
                            <td className='first__col'>
                                - Thời gian làm bài:
                            </td>
                            <td>
                                0 giờ 4 phút 40 giây
                            </td>
                        </tr>
                        <tr>
                            <td className='first__col'>
                                - Điểm tối thiểu cần phải đạt :
                            </td>
                            <td>
                                9 điểm
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div className="btn__start__oral__voca">
                    <button className=''>
                        Bắt đầu
                    </button>
                </div>
            </div>


        </div>

    )
}

export default InfoOralVocabulary