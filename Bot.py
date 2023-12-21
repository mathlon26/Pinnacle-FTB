import json
import MetaTrader5 as mt5
from datetime import datetime, timedelta

class trading_bot():
    def __init__(self, logger, auth, timezone_offset) -> None:
        self.Logger = logger
        self.status = {"running": False}
        self.login = auth[0]
        self.password = auth[1]
        self.server = auth[2]
        self.timezone_offset = timezone_offset
    
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
            for position in _past_positions:
                past_position_info = {
                    "id": position.ticket,
                    "open_time": position.time,
                    "symbol": position.symbol,
                    "lotsize": position.volume,
                    "type": "BUY" if position.type == 0 else "SELL",
                    "profit": position.profit,
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
            mt5.login("5020910256", password="0hQzNdX*", server="MetaQuotes-Demo")
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