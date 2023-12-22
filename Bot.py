import json
import eel
import MetaTrader5 as mt5
from datetime import datetime, timedelta
import threading
from time import sleep
import numpy as np

class trading_bot():
    def __init__(self, logger, auth, timezone_offset, tick=0.1, all_symbols=False) -> None:
        self.Logger = logger
        self.status = {"running": False}
        self.login = auth[0]
        self.password = auth[1]
        self.server = auth[2]
        self.tick = tick
        self.all_symbols = all_symbols
        self.timezone_offset = timezone_offset
        
        self.algo = Algo(self)
        self.algo_thread = None
        
    def get_bot_status(self, arg=None):
        status = self.status
        if arg:
            status = status[arg]
        status = json.dumps(status)
        return json.loads(status)
    
    def start_bot(self):
        if not self.status["running"]:
            self.status["running"] = True
            rapport = self.Logger.create_rapport(
                level=5, kind=6, msg="Try: start_bot() - Result: Bot started successfully", color="GREEN"
            )
            self.Logger._print(rapport=rapport)
            
            self.algo_thread = threading.Thread(target=self.algo.start)
            self.algo_thread.start()
            
            return True
        else:
            rapport = self.Logger.create_rapport(
                level=5, kind=6, msg="Try: start_bot() - Result: Bot is already running", color="YELLOW"
            )
            self.Logger._print(rapport=rapport)
            return False
    
    def stop_bot(self):
        if self.status["running"]:
            self.status["running"] = False
            rapport = self.Logger.create_rapport(
                level=5, kind=6, msg="Try: stop_bot() - Result: Bot stopped successfully", color="RED"
            )
            self.Logger._print(rapport=rapport)
            return True
        else:
            rapport = self.Logger.create_rapport(
                level=5, kind=6, msg="Try: stop_bot() - Result: Bot is not currently running", color="YELLOW"
            )
            self.Logger._print(rapport=rapport)
            return False
    
    
    def get_open_positions(self):
        open_positions = []

        if mt5.initialize():
            try:
                mt5.login(self.login, self.password, self.server)
                # Retrieve open positions
                positions = mt5.positions_get()
                
                # Access the first element of the tuple and iterate over it
                for position in positions:
                    position_info = {
                        "id": position.ticket,
                        "open_time": position.time,
                        "symbol": position.symbol,
                        "lotsize": position.volume,
                        "type": "BUY" if position.type == 0 else "SELL",
                        "open_price": position.price_open,
                        "current_price": position.price_current,
                        "profit": position.profit,
                        "position_id": position.identifier
                    }
                    open_positions.append(position_info)

            except Exception as e:
                rapport = self.Logger.create_rapport(
                    level=5, kind=6, msg=f"Error in get_open_positions: {str(e)}, {str(positions)}", color="WHITE"
                )
                self.Logger._print(rapport=rapport)
            finally:
                mt5.shutdown()
                

        return open_positions

        """
        return open_positions = {
            {"id": id, "symbol": symbol, "lotsize": lotsize, "type": type "open_price": open_price, "current_price": current_price, "profit": openprofit},
            eg. {"id": 2, "symbol": "EURUSD", "lotsize": 1.0, "type": "short", "open_price": "1.08023", "current_price": "1.08401", "profit": "102.30"},
            ...
        }
        """
    
    def get_history(self, timeframe):
        past_positions = []
        date_to = datetime.now()  # current date and time
        date_from = date_to - timedelta(days=timeframe)  # timeframe is in days
        date_to = date_to + timedelta(hours=self.timezone_offset)
        try:
            mt5.initialize()
            mt5.login(self.login, self.password, self.server)
            # Retrieve open positions
            _past_positions = mt5.history_deals_get(date_from, date_to)
            
            # Access the first element of the tuple and iterate over it
            cum_prof = 0
            for position in _past_positions:
                cum_prof += position.profit
                past_position_info = {
                    "id": position.ticket,
                    "open_time": position.time,
                    "symbol": position.symbol,
                    "lotsize": position.volume,
                    "type": "BUY" if position.type == 0 else "SELL",
                    "profit": position.profit,
                    "bal_before": cum_prof - position.profit,
                    "bal_after": cum_prof
                }
                past_positions.append(past_position_info)
        except Exception as e:
            rapport = self.Logger.create_rapport(
                level=5, kind=6, msg=f"Error in get_open_positions: {str(e)}, {str(_past_positions)}\n\n\n", color="WHITE"
            )
            self.Logger._print(rapport=rapport)
        finally:
            mt5.shutdown()

        return past_positions
        """
        return history = {
            {"id": id, "symbol": symbol, "lotsize": lotsize, "type": type "open_price": open_price, "close_price": close_price, "profit": realisedprofit},
            ...,
        }
        """
        
    def get_financials(self):
        mt5.initialize()
        accountinfo = mt5.account_info()
        
        tfs = [1,30,365]
        date_to = datetime.now()  # current date and time
        profit = {}
        start = {}
        for tf in tfs:
            positions = self.get_history(tf)
            profits = 0
            for position in positions:
                if position["symbol"] != '' and position["lotsize"] != 0.0:
                    profits += float(position["profit"])
                else:
                    start[tf] = position["profit"]
            profit[tf] = profits
        
        
        
        return {"balance": accountinfo.balance ,"equity": accountinfo.equity, "margin": accountinfo.margin_free, "currency": accountinfo.currency, "profit": profit, "initial-balance": start}
    
    
    def close_position(self, position_id, symbol, lot):
        try:
            mt5.initialize()
            mt5.login(self.login, self.password, self.server)
            price=mt5.symbol_info_tick(symbol).bid
            deviation=20
            request={
                "action": mt5.TRADE_ACTION_DEAL,
                "symbol": symbol,
                "volume": float(lot),
                "type": mt5.ORDER_TYPE_SELL,
                "position": position_id,
                "price": price,
                "deviation": deviation,
                "magic": 234000,
                "comment": "python script close",
                "type_time": mt5.ORDER_TIME_GTC,
                "type_filling": mt5.ORDER_FILLING_RETURN,
            }
            # send a trading request
            result=mt5.order_send(request)
            return result
        except:
            print("Exception")
            
            
class Algo():
    def __init__(self, _bot) -> None:
        self.bot = _bot
        self.all_symbols = self.bot.all_symbols
        self.tick = self.bot.tick
        self.timeframes_to_str = {
            mt5.TIMEFRAME_M1: "1m",
            mt5.TIMEFRAME_M5: "5m",
            mt5.TIMEFRAME_M15: "15m",
            mt5.TIMEFRAME_M30: "30m",
            mt5.TIMEFRAME_H1: "1H",
            mt5.TIMEFRAME_H4: "4H",
            mt5.TIMEFRAME_D1: "D",
            mt5.TIMEFRAME_W1: "W",
            mt5.TIMEFRAME_MN1: "M",
        }
        self.str_to_timeframes = {
            "1m": mt5.TIMEFRAME_M1,
            "5m": mt5.TIMEFRAME_M5,
            "15m": mt5.TIMEFRAME_M15,
            "30m": mt5.TIMEFRAME_M30,
            "1H": mt5.TIMEFRAME_H1,
            "4H": mt5.TIMEFRAME_H4,
            "D": mt5.TIMEFRAME_D1,
            "W": mt5.TIMEFRAME_W1,
            "M": mt5.TIMEFRAME_MN1,
        }
        self.history_length = {
            mt5.TIMEFRAME_M1: 50,
            mt5.TIMEFRAME_M5: 75,
            mt5.TIMEFRAME_M15: 100,
            mt5.TIMEFRAME_M30: 125,
            mt5.TIMEFRAME_H1: 150,
            mt5.TIMEFRAME_H4: 175,
            mt5.TIMEFRAME_D1: 200,
            mt5.TIMEFRAME_W1: 225,
            mt5.TIMEFRAME_MN1: 250,
        }
        self.order_types = {
            "buy": mt5.ORDER_TYPE_BUY,
            "sell": mt5.ORDER_TYPE_SELL,
            "buy_limit": mt5.ORDER_TYPE_BUY_LIMIT,
            "sell_limit": mt5.ORDER_TYPE_SELL_LIMIT,
            "buy_stop": mt5.ORDER_TYPE_BUY_STOP,
            "sell_stop": mt5.ORDER_TYPE_SELL_STOP,
            "buy_stop_limit": mt5.ORDER_TYPE_BUY_STOP_LIMIT,
            "sell_stop_limit": mt5.ORDER_TYPE_SELL_STOP_LIMIT,
            "close": mt5.ORDER_TYPE_CLOSE_BY
        }

    def get_tradeable_symbols(self):
        mt5.initialize()
        all_symbols = mt5.symbols_get()
        symbol_names = [symbol.name for symbol in all_symbols]
        return symbol_names
    
    def get_trading_symbols(self):
        with open("config.json", "r") as file:
            config = json.load(file)
        trading_symbols = []
        for symbol in config["trading"]["symbols"]:
            if symbol in self.get_tradeable_symbols():
                trading_symbols.append(symbol)
        return trading_symbols
    
    def get_trading_timeframes(self):
        with open("config.json", "r") as file:
            config = json.load(file)
        trading_timeframes = []
        for timeframe in config["trading"]["timeframes"]:
            if timeframe in self.str_to_timeframes.keys():
                trading_timeframes.append(self.str_to_timeframes[timeframe])
        return trading_timeframes            
    
    def get_data(self, symbol, timeframe, length):
        mt5.initialize()
        history = mt5.copy_rates_from_pos(symbol, timeframe, 0, length)
        formatted_history = []
        for candle in history:
            formatted_candle = []
            for num in candle:
                if num != candle[0]:
                    num = float(num)
                    formatted_candle.append(num)
                else:
                    formatted_candle.append(num)
                    
            formatted_candle = {"time": datetime.utcfromtimestamp(formatted_candle[0]).strftime("%d-%m-%Y %H:%M:%S"), "open": formatted_candle[1], "high": formatted_candle[2], "low": formatted_candle[3], "close": formatted_candle[4], "tick_volume": formatted_candle[5], "spread": formatted_candle[6], "real_volume": formatted_candle[7]}
            formatted_history.append(formatted_candle)
        
        return formatted_history
    
    def candle_is_bullish(self, candle):
        if candle["close"] > candle["open"]:
            return True
        else:
            return False
    
    def get_highs_and_lows(self, data):
        open_candle = data[0]
        lows = []
        highs = []
        for i in range(1, len(data)-1):
            candle = data[i]
            previous_candle = data[i+1]
            
            candle["index"] = i
            previous_candle["index"] = i+1
            
            
            if self.candle_is_bullish(candle):
                if not self.candle_is_bullish(previous_candle):
                    
                    lows.append([candle, previous_candle])
            else:
                if self.candle_is_bullish(previous_candle):
                    highs.append([candle, previous_candle])
                    
        return {"highs": highs, "lows": lows}
    
    def get_highest(self, highs):
        return highs[0]["high"] if highs[0]["high"] > highs[1]["high"] else highs[1]["high"]
    
    def get_lowest(self, lows):
        return lows[0]["low"] if lows[0]["low"] > lows[1]["low"] else lows[1]["low"]
           
    def all_equal(self, lst, key):
        ele = lst[0][key]
        chk = True
        # Comparing each element with first item
        for item in lst:
            if ele != item[key]:
                chk = False
                break
    
        if (chk == True):
            return True
        else:
            return False
    
    def bos(self, data, highs_and_lows):
        current_candle = data[0]
        last_candle = data[1]
        check_candle = data[2]
        last_high = highs_and_lows["highs"][0]
        last_low = highs_and_lows["lows"][0]
        
        last_high_highest = self.get_highest(last_high)
        last_low_lowest = self.get_lowest(last_low)
        
        if last_low_lowest > last_candle["close"]:
            # // We have a current bearish sentiment
            #if last_low_lowest < check_candle["close"]:
                # // SELL
            return 1
                
        elif last_high_highest < last_candle["close"]:
            # // We have a current bullish sentiment
            #if last_high_highest > check_candle["close"]:
                # // BUY                
            return 0
            
        elif last_low[1]["close"] < self.get_lowest(highs_and_lows["lows"][1]):
            if last_high_highest < last_candle["close"]:
                return 0
            else:
                return 1
         
        elif last_high[1]["close"] > self.get_highest(highs_and_lows["highs"][1]):
            if last_low_lowest > last_candle["close"]:
                return 1
            else:
                return 0
               
        return 2

                
    def sentiment(self, data, symbol, timeframe):
        data_to_read = data[symbol][timeframe]
        data_to_read.reverse()
        highs_and_lows = self.get_highs_and_lows(data_to_read)
        bos = self.bos(data_to_read, highs_and_lows)
        return bos
    
    def execute(self, order_type, symbol, data):
        try:
            mt5.initialize()
            mt5.login(self.bot.login, self.bot.password, self.bot.server)
            file = open("config.json", "r")
            config = json.load(file)
            
            max_spread = config["risk_management"]["max_spread"]
            risk = config["risk_management"]["risk"]
            stoploss = config["risk_management"]["stoploss"]
            takeprofit = config["risk_management"]["takeprofit"]
            max_positions = config["risk_management"]["max_positions"]
            lot_size = config["risk_management"]["lot_size"]
            order_offset = config["trading"]["order_offset"]
            trade_comment = config["trading"]["trade_comment"]
            positions=mt5.positions_get(group=symbol)
            if positions==None or len(positions) == 0:
                if int(max_positions) > int(mt5.positions_total()):
                    print(f"{self.bot.login}, {self.bot.password}, {self.bot.server}")
                    point = float(mt5.symbol_info(symbol).point)
                    priceAsk=mt5.symbol_info_tick(symbol).ask
                    priceBid=mt5.symbol_info_tick(symbol).bid
                    print(abs(priceBid - priceAsk))
                    print(max_spread)
                    if float(abs(priceBid - priceAsk) < float(float(max_spread) * point)):
                        if order_offset == "market":
                            offer = priceAsk
                        else:
                            offer = priceAsk - (point*order_offset)
                        
                        sl = offer - float(stoploss) * float(point)
                        tp = offer + float(takeprofit) * float(point)
                        
                        request = {
                            "action": mt5.TRADE_ACTION_DEAL,
                            "symbol": str(symbol),
                            "volume": float(lot_size),
                            "type": int(self.order_types[order_type]),
                            "price": float(offer),
                            "sl": float(sl),
                            "tp": float(tp),
                            "deviation": int(max_spread),
                            "magic": 234000,
                            "comment": str(trade_comment),
                            "type_time": mt5.ORDER_TIME_GTC,
                            "type_filling": mt5.ORDER_FILLING_RETURN,
                        }
                        # send a trading request
                        result=mt5.order_send(request)
                        return f"Executing for {symbol}\n               result: \n{result}\n"
                    else:
                        return f"Executing for {symbol}\n               result: \nspread:{abs(priceBid - priceAsk)}, max_spread:{str(float(float(max_spread) * point))}\n"
                else:
                    return f"Executing for {symbol}\n               result: Max position amount reached\n"
            else:
                return f"Executing for {symbol}\n               result: Already has open position: \n               {positions}\n"
        except:
            return "Exception"
        
        
    def start(self):
        
            mt5.initialize()
            mt5.login(self.bot.login, self.bot.password, self.bot.server)
            
            while self.bot.status["running"]:
                try:
                    tfs = self.get_trading_timeframes()
                    

                    syms = self.get_trading_symbols()
                    data = {}
                    for sym in syms:
                        data[sym] = {}
                    
                    for sym in syms:
                        for tf in tfs:
                            data[sym][tf] = self.get_data(sym, tf, self.history_length[tf])

                    sentiments = {}
                    for sym in syms:
                        sentiments[sym] = []
                        
                        
                        for tf in tfs:
                            stm = self.sentiment(data, sym, tf)
                            sentiments[sym].append({"tf": tf, "stm": stm})
                        
                            
                    for sym in syms:
                        sleep(self.tick)
                        if self.all_equal(sentiments[sym], "stm") and sentiments[sym][0]["stm"] == 0:
                            rapport = self.bot.Logger.create_rapport(level=7, kind=6, msg=self.execute("buy", sym, data), color="GREEN")
                            self.bot.Logger._print(rapport=rapport, clear_first=True)
                            continue
                        elif self.all_equal(sentiments[sym], "stm") and sentiments[sym][0]["stm"] == 1:
                            rapport = self.bot.Logger.create_rapport(level=7, kind=6, msg=self.execute("sell", sym, data), color="GREEN")
                            self.bot.Logger._print(rapport=rapport, clear_first=True)
                            continue
                        else:
                            rapport = self.bot.Logger.create_rapport(level=7, kind=6, msg=f"{sym} No action required", color="YELLOW")
                            self.bot.Logger._print(rapport=rapport, clear_first=True)
                            continue
                except:
                    eel.stopBot()    
                

                                