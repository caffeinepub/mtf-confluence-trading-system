import Array "mo:core/Array";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Float "mo:core/Float";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Type
  public type UserProfile = {
    name : Text;
  };

  // Data Types
  type Trade = {
    id : Nat;
    owner : Principal;
    date : Text;
    pair : Text;
    direction : Text;
    marketStructureBias : Text;
    weeklyBias : Text;
    dailyBias : Text;
    fourHBias : Text;
    aoiLevel : Text;
    marketStage : Text;
    pattern4H : Text;
    lowerTFSignal : Text;
    candleType : Text;
    entry : Float;
    sl : Float;
    tp : Float;
    lotSize : Float;
    riskPips : Float;
    rewardPips : Float;
    rr : Float;
    pnl : Float;
    notes : Text;
    confluenceScore : Float;
    result : Text;
    createdAt : Int;
  };

  // Trade comparison module
  module Trade {
    public func compareById(t1 : Trade, t2 : Trade) : Order.Order {
      Nat.compare(t1.id, t2.id);
    };

    public func compareByPnl(t1 : Trade, t2 : Trade) : Order.Order {
      Float.compare(t1.pnl, t2.pnl);
    };

    public func compareByDate(t1 : Trade, t2 : Trade) : Order.Order {
      Text.compare(t1.date, t2.date);
    };
  };

  // State management
  var nextId = 1;
  let trades = Map.empty<Nat, Trade>();

  // Authorization helper functions
  private func isTradeOwner(caller : Principal, trade : Trade) : Bool {
    Principal.equal(caller, trade.owner);
  };

  private func canAccessTrade(caller : Principal, trade : Trade) : Bool {
    isTradeOwner(caller, trade) or AccessControl.isAdmin(accessControlState, caller);
  };

  // Add a new trade
  public shared ({ caller }) func addTrade(
    date : Text,
    pair : Text,
    direction : Text,
    marketStructureBias : Text,
    weeklyBias : Text,
    dailyBias : Text,
    fourHBias : Text,
    aoiLevel : Text,
    marketStage : Text,
    pattern4H : Text,
    lowerTFSignal : Text,
    candleType : Text,
    entry : Float,
    sl : Float,
    tp : Float,
    lotSize : Float,
    riskPips : Float,
    rewardPips : Float,
    rr : Float,
    pnl : Float,
    notes : Text,
    confluenceScore : Float,
    result : Text,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add trades");
    };

    let id = nextId;
    nextId += 1;
    let createdAt = Time.now();
    let trade : Trade = {
      id;
      owner = caller;
      date;
      pair;
      direction;
      marketStructureBias;
      weeklyBias;
      dailyBias;
      fourHBias;
      aoiLevel;
      marketStage;
      pattern4H;
      lowerTFSignal;
      candleType;
      entry;
      sl;
      tp;
      lotSize;
      riskPips;
      rewardPips;
      rr;
      pnl;
      notes;
      confluenceScore;
      result;
      createdAt;
    };
    trades.add(id, trade);
    id;
  };

  // Get all trades (user sees only their own, admin sees all)
  public query ({ caller }) func getTrades() : async [Trade] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view trades");
    };

    let allTrades = trades.values().toArray();

    if (AccessControl.isAdmin(accessControlState, caller)) {
      // Admins can see all trades
      allTrades;
    } else {
      // Users can only see their own trades
      allTrades.filter<Trade>(func(trade) { isTradeOwner(caller, trade) });
    };
  };

  // Get trade by ID
  public query ({ caller }) func getTradeById(id : Nat) : async ?Trade {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view trades");
    };

    switch (trades.get(id)) {
      case (null) { null };
      case (?trade) {
        if (canAccessTrade(caller, trade)) {
          ?trade;
        } else {
          Runtime.trap("Unauthorized: You can only view your own trades");
        };
      };
    };
  };

  // Update a trade
  public shared ({ caller }) func updateTrade(
    id : Nat,
    date : Text,
    pair : Text,
    direction : Text,
    marketStructureBias : Text,
    weeklyBias : Text,
    dailyBias : Text,
    fourHBias : Text,
    aoiLevel : Text,
    marketStage : Text,
    pattern4H : Text,
    lowerTFSignal : Text,
    candleType : Text,
    entry : Float,
    sl : Float,
    tp : Float,
    lotSize : Float,
    riskPips : Float,
    rewardPips : Float,
    rr : Float,
    pnl : Float,
    notes : Text,
    confluenceScore : Float,
    result : Text,
  ) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update trades");
    };

    switch (trades.get(id)) {
      case (null) { Runtime.trap("Trade not found: " # id.toText()) };
      case (?existingTrade) {
        if (not canAccessTrade(caller, existingTrade)) {
          Runtime.trap("Unauthorized: You can only update your own trades");
        };

        let updatedTrade : Trade = {
          existingTrade with
          date;
          pair;
          direction;
          marketStructureBias;
          weeklyBias;
          dailyBias;
          fourHBias;
          aoiLevel;
          marketStage;
          pattern4H;
          lowerTFSignal;
          candleType;
          entry;
          sl;
          tp;
          lotSize;
          riskPips;
          rewardPips;
          rr;
          pnl;
          notes;
          confluenceScore;
          result;
        };
        trades.add(id, updatedTrade);
        true;
      };
    };
  };

  // Delete a trade
  public shared ({ caller }) func deleteTrade(id : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete trades");
    };

    switch (trades.get(id)) {
      case (null) { Runtime.trap("Trade not found: " # id.toText()) };
      case (?trade) {
        if (not canAccessTrade(caller, trade)) {
          Runtime.trap("Unauthorized: You can only delete your own trades");
        };
        trades.remove(id);
        true;
      };
    };
  };

  // Get stats (user sees only their own stats, admin sees all)
  public query ({ caller }) func getStats() : async {
    totalTrades : Nat;
    wins : Nat;
    losses : Nat;
    pending : Nat;
    totalPnl : Float;
    winRate : Float;
    avgRR : Float;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view statistics");
    };

    let allTrades = trades.values().toArray();

    // Filter trades based on user role
    let relevantTrades = if (AccessControl.isAdmin(accessControlState, caller)) {
      allTrades;
    } else {
      allTrades.filter(func(trade) { isTradeOwner(caller, trade) });
    };

    let totalTrades = relevantTrades.size();
    if (totalTrades == 0) {
      return {
        totalTrades = 0;
        wins = 0;
        losses = 0;
        pending = 0;
        totalPnl = 0.0;
        winRate = 0.0;
        avgRR = 0.0;
      };
    };

    var wins = 0;
    var losses = 0;
    var pending = 0;
    var totalPnl = 0.0;
    var totalRR = 0.0;

    for (trade in relevantTrades.values()) {
      switch (trade.result) {
        case ("Win") { wins += 1 };
        case ("Loss") { losses += 1 };
        case ("Pending") { pending += 1 };
        case (_) {};
      };
      totalPnl += trade.pnl;
      totalRR += trade.rr;
    };

    let winRate = if (wins + losses > 0) {
      wins.toNat().toFloat() / (wins + losses).toFloat();
    } else { 0.0 };

    let avgRR = totalRR / totalTrades.toFloat();

    {
      totalTrades;
      wins;
      losses;
      pending;
      totalPnl;
      winRate;
      avgRR;
    };
  };
};
