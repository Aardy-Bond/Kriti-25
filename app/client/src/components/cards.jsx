const Cards = ({ uname, eth, percent }) => {
  return (
    <div className="bg-[#4E4E4E] rounded-lg flex flex-col">
      <div className="text-[22px] m-3"> </div>

      <div className="flex width-full justify-evenly place-items-center">
        <div className="text-[22px]">{eth}</div>
        <div className="text-[22px]"> {percent}</div>
        <button className=" relative bottom-3 h-auto cursor-button border-[0px] border-[solid] border-[rgb(187,204,0)] text-[12px] text-white px-[30px] py-[10px] [transition:300ms] w-[25%] [box-shadow:rgba(14,_30,_37,_0.12)_0px_2px_4px_0px,_rgba(14,_30,_37,_0.32)_0px_2px_16px_0px] rounded-[50px] bg-[rgb(204,_0,_0)] hover:text-[rgb(255,_255,_255)] hover:w-[30%] hover:bg-[rgb(30,_30,_30)_none_repeat_scroll_0%_0%_/_auto_padding-box_border-box] hover:border-[rgb(255,_255,_255)] hover:border-4 hover:border-solid">
          BUY
        </button>
      </div>
    </div>
  );
};

export default Cards;
