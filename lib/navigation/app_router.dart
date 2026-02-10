import 'package:flutter/material.dart';
import 'package:campulse_mobile/models/post.dart';

class AppRoute {
  final String path;
  final Map<String, String>? params;

  AppRoute(this.path, {this.params});

  static AppRoute home() => AppRoute('/');
  static AppRoute events() => AppRoute('/events');
  static AppRoute freeFood() => AppRoute('/free-food');
  static AppRoute opportunities() => AppRoute('/opportunities');
  static AppRoute postDetail(String postId) => AppRoute('/post/$postId');
  static AppRoute createPost() => AppRoute('/create');
  static AppRoute profile(String? userId) => AppRoute('/profile/${userId ?? ''}');
  static AppRoute saved() => AppRoute('/saved');
  static AppRoute login() => AppRoute('/login');
  static AppRoute signup() => AppRoute('/signup');
}

class AppRouterDelegate extends RouterDelegate<AppRoute>
    with ChangeNotifier, PopNavigatorRouterDelegateMixin<AppRoute> {
  final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();
  
  AppRoute _currentRoute = AppRoute.home();
  final List<AppRoute> _routeStack = [AppRoute.home()];

  @override
  AppRoute get currentConfiguration => _currentRoute;

  void push(AppRoute route) {
    _routeStack.add(route);
    _currentRoute = route;
    notifyListeners();
  }

  void pop() {
    if (_routeStack.length > 1) {
      _routeStack.removeLast();
      _currentRoute = _routeStack.last;
      notifyListeners();
    }
  }

  void replace(AppRoute route) {
    if (_routeStack.isNotEmpty) {
      _routeStack.removeLast();
    }
    _routeStack.add(route);
    _currentRoute = route;
    notifyListeners();
  }

  void setNewRoutePath(AppRoute route) {
    _routeStack.clear();
    _routeStack.add(route);
    _currentRoute = route;
    notifyListeners();
  }

  @override
  Widget build(BuildContext context) {
    return Navigator(
      key: navigatorKey,
      pages: _routeStack.map((route) => _buildPage(route)).toList(),
      onPopPage: (route, result) {
        if (!route.didPop(result)) {
          return false;
        }
        pop();
        return true;
      },
    );
  }

  Page _buildPage(AppRoute route) {
    // This will be handled by the main app structure
    // Pages are built in MainScreen and individual screens
    return MaterialPage(
      key: ValueKey(route.path),
      child: Container(), // Placeholder
    );
  }
}

class AppRouteInformationParser extends RouteInformationParser<AppRoute> {
  @override
  Future<AppRoute> parseRouteInformation(RouteInformation routeInformation) async {
    final uri = Uri.parse(routeInformation.uri.toString());
    return AppRoute(uri.path);
  }

  @override
  RouteInformation? restoreRouteInformation(AppRoute configuration) {
    return RouteInformation(uri: Uri.parse(configuration.path));
  }
}

